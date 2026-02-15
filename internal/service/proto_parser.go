package service

import (
	"fmt"
	"path/filepath"

	"grpc-tool/internal/model"

	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/desc/protoparse"
	dpb "google.golang.org/protobuf/types/descriptorpb"
)

type ProtoParserService struct{}

func NewProtoParserService() *ProtoParserService {
	return &ProtoParserService{}
}

func (s *ProtoParserService) ParseProto(path string, importPaths []string) ([]*model.ServiceDesc, error) {
	parser := protoparse.Parser{
		ImportPaths:           importPaths,
		IncludeSourceCodeInfo: true,
	}

	// Resolve absolute path for the main file
	absPath, err := filepath.Abs(path)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve absolute path: %w", err)
	}

	// Use the directory of the file as an import path as well
	dir := filepath.Dir(absPath)
	parser.ImportPaths = append(parser.ImportPaths, dir)

	// File name to parse (relative to the added import path)
	filename := filepath.Base(path)

	fds, err := parser.ParseFiles(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to parse proto file: %w", err)
	}

	var services []*model.ServiceDesc
	for _, fd := range fds {
		for _, sd := range fd.GetServices() {
			svc := &model.ServiceDesc{
				Name: sd.GetFullyQualifiedName(),
			}

			for _, md := range sd.GetMethods() {
				m := &model.MethodDesc{
					Name:        md.GetName(),
					InputType:   md.GetInputType().GetFullyQualifiedName(),
					OutputType:  md.GetOutputType().GetFullyQualifiedName(),
					Description: md.GetSourceInfo().GetLeadingComments(),
					InputSchema: s.extractFieldDesc(md.GetInputType(), 0),
				}
				svc.Methods = append(svc.Methods, m)
			}
			services = append(services, svc)
		}
	}

	return services, nil
}

func (s *ProtoParserService) GetMethodDescriptor(protoPath, serviceName, methodName string, importPaths []string) (*desc.MethodDescriptor, error) {
	parser := protoparse.Parser{
		ImportPaths:           importPaths,
		IncludeSourceCodeInfo: true,
	}

	// Resolve absolute path
	absPath, err := filepath.Abs(protoPath)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve absolute path: %w", err)
	}

	// Add dir to import paths
	dir := filepath.Dir(absPath)
	parser.ImportPaths = append(parser.ImportPaths, dir)

	filename := filepath.Base(protoPath)
	fds, err := parser.ParseFiles(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to parse proto file: %w", err)
	}

	if len(fds) == 0 {
		return nil, fmt.Errorf("no file descriptor found")
	}

	fd := fds[0]
	// Find service
	sd := fd.FindService(serviceName)
	if sd == nil {
		// Try to find by fully qualified name if package is involved
		// But FindService usually expects just the name if inside the package?
		// Actually FindService on FileDescriptor looks for symbol.
		// If serviceName is fully qualified "test.Greeter", we might need to search differently or just loop.
		for _, s := range fd.GetServices() {
			if s.GetFullyQualifiedName() == serviceName {
				sd = s
				break
			}
		}
	}

	if sd == nil {
		return nil, fmt.Errorf("service not found: %s", serviceName)
	}

	// Find method
	md := sd.FindMethodByName(methodName)
	if md == nil {
		return nil, fmt.Errorf("method not found: %s", methodName)
	}

	return md, nil
}

func (s *ProtoParserService) extractFieldDesc(md *desc.MessageDescriptor, depth int) *model.FieldDesc {
	if depth > 5 { // Prevent infinite recursion
		return &model.FieldDesc{
			Name: md.GetName(),
			Type: "recursive_limit_exceeded",
		}
	}

	root := &model.FieldDesc{
		Name:     md.GetName(),
		Type:     "message",
		JsonName: md.GetName(),
		Children: []*model.FieldDesc{},
	}

	for _, fd := range md.GetFields() {
		child := &model.FieldDesc{
			Name:     fd.GetName(),
			JsonName: fd.GetJSONName(),
			IsMap:    fd.IsMap(),
			IsOneof:  fd.GetOneOf() != nil,
		}

		if fd.IsRepeated() && !fd.IsMap() {
			child.Label = "repeated"
		} else {
			child.Label = "optional" // proto3 default
		}

		if fd.GetType() == dpb.FieldDescriptorProto_TYPE_MESSAGE {
			child.Type = "message"
			nestedMsg := fd.GetMessageType()
			nestedDesc := s.extractFieldDesc(nestedMsg, depth+1)
			child.Children = nestedDesc.Children
		} else if fd.GetType() == dpb.FieldDescriptorProto_TYPE_ENUM {
			child.Type = "enum"
			for _, ev := range fd.GetEnumType().GetValues() {
				child.EnumVals = append(child.EnumVals, ev.GetName())
			}
		} else {
			child.Type = cleanupType(fd.GetType())
		}

		root.Children = append(root.Children, child)
	}

	return root
}

func cleanupType(t dpb.FieldDescriptorProto_Type) string {
	switch t {
	case dpb.FieldDescriptorProto_TYPE_DOUBLE:
		return "double"
	case dpb.FieldDescriptorProto_TYPE_FLOAT:
		return "float"
	case dpb.FieldDescriptorProto_TYPE_INT64:
		return "int64"
	case dpb.FieldDescriptorProto_TYPE_UINT64:
		return "uint64"
	case dpb.FieldDescriptorProto_TYPE_INT32:
		return "int32"
	case dpb.FieldDescriptorProto_TYPE_FIXED64:
		return "fixed64"
	case dpb.FieldDescriptorProto_TYPE_FIXED32:
		return "fixed32"
	case dpb.FieldDescriptorProto_TYPE_BOOL:
		return "bool"
	case dpb.FieldDescriptorProto_TYPE_STRING:
		return "string"
	case dpb.FieldDescriptorProto_TYPE_GROUP:
		return "group"
	case dpb.FieldDescriptorProto_TYPE_MESSAGE:
		return "message"
	case dpb.FieldDescriptorProto_TYPE_BYTES:
		return "bytes"
	case dpb.FieldDescriptorProto_TYPE_UINT32:
		return "uint32"
	case dpb.FieldDescriptorProto_TYPE_ENUM:
		return "enum"
	case dpb.FieldDescriptorProto_TYPE_SFIXED32:
		return "sfixed32"
	case dpb.FieldDescriptorProto_TYPE_SFIXED64:
		return "sfixed64"
	case dpb.FieldDescriptorProto_TYPE_SINT32:
		return "sint32"
	case dpb.FieldDescriptorProto_TYPE_SINT64:
		return "sint64"
	}
	return t.String()
}
