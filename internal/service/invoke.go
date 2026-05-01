package service

import (
	"context"
	"encoding/json"
	"fmt"

	"grpc-tool/internal/model"

	"github.com/jhump/protoreflect/desc/protoparse"
	"github.com/jhump/protoreflect/dynamic"
	"github.com/jhump/protoreflect/dynamic/grpcdynamic"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type InvokeService struct{}

func NewInvokeService() *InvokeService {
	return &InvokeService{}
}

type InvokeResult struct {
	Response json.RawMessage `json:"response,omitempty"`
	Error    string          `json:"error,omitempty"`
}

func (s *InvokeService) Invoke(ctx context.Context, config model.TestConfig) (*InvokeResult, error) {
	// Parse proto
	p := protoparse.Parser{ImportPaths: []string{"."}}
	fds, err := p.ParseFiles(config.ProtoPath)
	if err != nil {
		return nil, fmt.Errorf("proto parse failed: %w", err)
	}

	// Find service & method descriptor
	var methodDesc *dynamic.Message
	_ = methodDesc

	var svcDesc interface{ FindMethodByName(string) interface{ GetInputType() interface{} } }
	_ = svcDesc

	fd := fds[0]
	sd := fd.FindSymbol(config.Service)
	if sd == nil {
		return nil, fmt.Errorf("service %q not found in proto", config.Service)
	}

	svcFile := fd
	_ = svcFile

	// Find method
	var grpcMethodDesc interface{}
	_ = grpcMethodDesc

	for _, svc := range fd.GetServices() {
		if svc.GetFullyQualifiedName() == config.Service || svc.GetName() == config.Service {
			for _, m := range svc.GetMethods() {
				if m.GetName() == config.Method {
					// Build input message
					inputDesc := m.GetInputType()
					inputMsg := dynamic.NewMessage(inputDesc)

					if config.Data != "" && config.Data != "{}" {
						if err := inputMsg.UnmarshalJSON([]byte(config.Data)); err != nil {
							return nil, fmt.Errorf("invalid request data: %w", err)
						}
					}

					// Dial
					var dialOpts []grpc.DialOption
					if config.Insecure {
						dialOpts = append(dialOpts, grpc.WithTransportCredentials(insecure.NewCredentials()))
					}

					//nolint:staticcheck
					conn, err := grpc.DialContext(ctx, config.Host, dialOpts...)
					if err != nil {
						return nil, fmt.Errorf("dial failed: %w", err)
					}
					defer conn.Close()

					stub := grpcdynamic.NewStub(conn)
					resp, err := stub.InvokeRpc(ctx, m, inputMsg)
					if err != nil {
						return &InvokeResult{Error: err.Error()}, nil
					}

					respMsg, ok := resp.(*dynamic.Message)
					if !ok {
						return &InvokeResult{Error: "unexpected response type"}, nil
					}

					respJSON, err := respMsg.MarshalJSON()
					if err != nil {
						return nil, fmt.Errorf("marshal response: %w", err)
					}

					return &InvokeResult{Response: respJSON}, nil
				}
			}
			return nil, fmt.Errorf("method %q not found in service %q", config.Method, config.Service)
		}
	}

	return nil, fmt.Errorf("service %q not found", config.Service)
}
