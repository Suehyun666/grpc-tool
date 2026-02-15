package model

// FieldDesc represents a field in a gRPC message
type FieldDesc struct {
	Name     string       `json:"name"`
	Type     string       `json:"type"`               // string, int32, bool, message, enum, etc.
	Label    string       `json:"label,omitempty"`    // repeated, optional
	JsonName string       `json:"jsonName,omitempty"` // JSON field name
	IsMap    bool         `json:"isMap,omitempty"`
	IsOneof  bool         `json:"isOneof,omitempty"`
	Children []*FieldDesc `json:"children,omitempty"` // For nested messages
	EnumVals []string     `json:"enumVals,omitempty"` // For enum types
}

// MethodDesc represents a gRPC method
type MethodDesc struct {
	Name        string     `json:"name"`
	InputType   string     `json:"inputType"`
	OutputType  string     `json:"outputType"`
	Description string     `json:"description,omitempty"`
	InputSchema *FieldDesc `json:"inputSchema,omitempty"` // Detailed schema for UI generation
}

// ServiceDesc represents a gRPC service
type ServiceDesc struct {
	Name    string        `json:"name"`
	Methods []*MethodDesc `json:"methods"`
}
