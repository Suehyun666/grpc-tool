package service

import (
	"context"
	"encoding/json"
	"fmt"
	"path/filepath"
	"time"

	"github.com/jhump/protoreflect/dynamic"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type InvokerService struct {
	ProtoParser *ProtoParserService
}

func NewInvokerService(pp *ProtoParserService) *InvokerService {
	return &InvokerService{ProtoParser: pp}
}

type InvocationRequest struct {
	ProtoPath   string            `json:"protoPath"`
	ServiceName string            `json:"serviceName"` // Full name: package.Service
	MethodName  string            `json:"methodName"`
	Host        string            `json:"host"`
	InputData   json.RawMessage   `json:"inputData"` // JSON object
	Metadata    map[string]string `json:"metadata"`
	Timeout     int               `json:"timeout"` // Seconds
}

type InvocationResponse struct {
	Status     string            `json:"status"` // OK, ERROR
	StatusCode string            `json:"statusCode"`
	Body       json.RawMessage   `json:"body"`
	Headers    map[string]string `json:"headers"`
	Trailers   map[string]string `json:"trailers"`
	TimeMs     int64             `json:"timeMs"`
	Error      string            `json:"error,omitempty"`
}

func (s *InvokerService) Invoke(ctx context.Context, req InvocationRequest) (*InvocationResponse, error) {
	// 1. Get Method Descriptor
	// Assume proto file is in upload dir or absolute path.
	// We need to handle imports carefully. For now, we assume the dir of protoPath is sufficient or standard imports.
	// Ideally we should pass import paths to InvocationRequest if needed.
	importPaths := []string{filepath.Dir(req.ProtoPath)}
	md, err := s.ProtoParser.GetMethodDescriptor(req.ProtoPath, req.ServiceName, req.MethodName, importPaths)
	if err != nil {
		return nil, fmt.Errorf("failed to get method descriptor: %w", err)
	}

	// 2. Create Request Message
	msg := dynamic.NewMessage(md.GetInputType())
	if err := msg.UnmarshalJSON(req.InputData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal input data: %w", err)
	}

	// 3. Dial Config
	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()), // Todo: Add TLS support
		grpc.WithBlock(), // Wait for connection
	}

	dialCtx, cancel := context.WithTimeout(ctx, 5*time.Second) // Connection timeout
	defer cancel()

	conn, err := grpc.DialContext(dialCtx, req.Host, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to host %s: %w", req.Host, err)
	}
	defer conn.Close()

	// 4. Invoke
	stub := grpcdynamic.NewStub(conn)

	// Prepare context with metadata/timeout
	outMd := metadata.New(req.Metadata)
	callCtx := metadata.NewOutgoingContext(ctx, outMd)
	if req.Timeout > 0 {
		var cancelCall context.CancelFunc
		callCtx, cancelCall = context.WithTimeout(callCtx, time.Duration(req.Timeout)*time.Second)
		defer cancelCall()
	}

	var header, trailer metadata.MD

	start := time.Now()
	resp, err := stub.InvokeRpc(callCtx, md, msg, grpc.Header(&header), grpc.Trailer(&trailer))
	duration := time.Since(start)

	// 5. Process Response
	res := &InvocationResponse{
		TimeMs:   duration.Milliseconds(),
		Headers:  convertMetadata(header),
		Trailers: convertMetadata(trailer),
	}

	if err != nil {
		st, ok := status.FromError(err)
		if ok {
			res.StatusCode = st.Code().String()
			res.Status = "ERROR"
			res.Error = st.Message()
		} else {
			res.Status = "ERROR"
			res.Error = err.Error()
		}
	} else {
		res.Status = "OK"
		res.StatusCode = "OK"

		// Convert response message to JSON
		// We use standard json marshaler or dynamic message marshaler
		b, err := resp.(*dynamic.Message).MarshalJSON()
		if err != nil {
			// Fallback
			res.Body = json.RawMessage(fmt.Sprintf(`{"error": "failed to marshal response %v"}`, err))
		} else {
			res.Body = b
		}
	}

	return res, nil
}

func convertMetadata(md metadata.MD) map[string]string {
	res := make(map[string]string)
	for k, v := range md {
		if len(v) > 0 {
			res[k] = v[0] // Simple view: take first value
		}
	}
	return res
}
