package service

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"grpc-tool/internal/model"

	"github.com/bojand/ghz/runner"
)

type LoadTesterService struct{}

func NewLoadTesterService() *LoadTesterService {
	return &LoadTesterService{}
}

func (s *LoadTesterService) RunLoadTest(ctx context.Context, config model.TestConfig) (*runner.Report, error) {
	opts, err := s.buildOptions(config)
	if err != nil {
		return nil, err
	}

	call := fmt.Sprintf("%s.%s", config.Service, config.Method)

	report, err := runner.Run(call, config.Host, opts...)
	if err != nil {
		return nil, fmt.Errorf("load test failed: %w", err)
	}

	return report, nil
}

// parseDuration parses a duration string. If the string is a plain number
// (e.g. "10"), it treats it as seconds. Otherwise delegates to time.ParseDuration.
func parseDuration(s string) (time.Duration, error) {
	if s == "" {
		return 0, fmt.Errorf("empty duration")
	}
	// Try standard parse first
	d, err := time.ParseDuration(s)
	if err == nil {
		return d, nil
	}
	// If it's a plain number, treat as seconds
	if n, err2 := strconv.ParseFloat(s, 64); err2 == nil {
		return time.Duration(n * float64(time.Second)), nil
	}
	return 0, err
}

func (s *LoadTesterService) buildOptions(config model.TestConfig) ([]runner.Option, error) {
	var opts []runner.Option

	// Proto & connection
	opts = append(opts, runner.WithProtoFile(config.ProtoPath, nil))
	opts = append(opts, runner.WithInsecure(config.Insecure))

	// Data
	if config.Data != "" {
		var data interface{}
		if err := json.Unmarshal([]byte(config.Data), &data); err != nil {
			return nil, fmt.Errorf("invalid json data: %w", err)
		}
		opts = append(opts, runner.WithData(data))
	}

	// Metadata
	if config.Metadata != nil {
		opts = append(opts, runner.WithMetadata(config.Metadata))
	}

	// Timeout
	if config.Timeout > 0 {
		opts = append(opts, runner.WithTimeout(time.Duration(config.Timeout)*time.Second))
	}

	// Flat options — apply each non-zero/non-empty field independently
	// For step/line schedules, explicitly set total=0 to remove the default 200 limit
	if config.TotalRequests > 0 {
		opts = append(opts, runner.WithTotalRequests(uint(config.TotalRequests)))
	} else if config.LoadSchedule == "step" || config.LoadSchedule == "line" {
		opts = append(opts, runner.WithTotalRequests(0))
	}
	if config.RPS > 0 {
		opts = append(opts, runner.WithRPS(uint(config.RPS)))
	}
	if config.Duration != "" {
		if dur, err := parseDuration(config.Duration); err == nil {
			opts = append(opts, runner.WithRunDuration(dur))
		}
	}
	if config.Concurrency > 0 {
		opts = append(opts, runner.WithConcurrency(uint(config.Concurrency)))
	}
	if config.LoadSchedule != "" {
		opts = append(opts, runner.WithLoadSchedule(config.LoadSchedule))
	}
	if config.LoadStart > 0 {
		opts = append(opts, runner.WithLoadStart(uint(config.LoadStart)))
	}
	if config.LoadEnd > 0 {
		opts = append(opts, runner.WithLoadEnd(uint(config.LoadEnd)))
	}
	if config.LoadStep > 0 {
		opts = append(opts, runner.WithLoadStep(config.LoadStep))
	}
	if config.LoadStepDuration != "" {
		if d, err := parseDuration(config.LoadStepDuration); err == nil {
			opts = append(opts, runner.WithLoadStepDuration(d))
		}
	}

	// Advanced options
	if config.Connections > 0 {
		opts = append(opts, runner.WithConnections(uint(config.Connections)))
	}
	if config.DialTimeout > 0 {
		opts = append(opts, runner.WithDialTimeout(time.Duration(config.DialTimeout)*time.Second))
	}
	if config.CPUs > 0 {
		opts = append(opts, runner.WithCPUs(uint(config.CPUs)))
	}

	// Concurrency schedule
	if config.ConcurrencySchedule != "" {
		opts = append(opts, runner.WithConcurrencySchedule(config.ConcurrencySchedule))
	}
	if config.ConcurrencyStart > 0 {
		opts = append(opts, runner.WithConcurrencyStart(uint(config.ConcurrencyStart)))
	}
	if config.ConcurrencyEnd > 0 {
		opts = append(opts, runner.WithConcurrencyEnd(uint(config.ConcurrencyEnd)))
	}
	if config.ConcurrencyStep > 0 {
		opts = append(opts, runner.WithConcurrencyStep(config.ConcurrencyStep))
	}
	if config.ConcurrencyStepDuration != "" {
		if d, err := parseDuration(config.ConcurrencyStepDuration); err == nil {
			opts = append(opts, runner.WithConcurrencyStepDuration(d))
		}
	}

	return opts, nil
}
