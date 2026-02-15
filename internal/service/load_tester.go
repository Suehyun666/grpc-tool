package service

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"grpc-tool/internal/model"

	"github.com/bojand/ghz/runner"
)

type LoadTesterService struct{}

func NewLoadTesterService() *LoadTesterService {
	return &LoadTesterService{}
}

func (s *LoadTesterService) RunLoadTest(ctx context.Context, config model.TestConfig) (*runner.Report, error) {
	// Build runner options
	var opts []runner.Option

	// Common options
	opts = append(opts, runner.WithProtoFile(config.ProtoPath, nil))
	opts = append(opts, runner.WithInsecure(config.Insecure))

	if config.Data != "" {
		var data interface{}
		if err := json.Unmarshal([]byte(config.Data), &data); err != nil {
			return nil, fmt.Errorf("invalid json data: %w", err)
		}
		opts = append(opts, runner.WithData(data))
	}

	if config.Metadata != nil {
		opts = append(opts, runner.WithMetadata(config.Metadata))
	}

	opts = append(opts, runner.WithTimeout(time.Duration(config.Timeout)*time.Second))

	// Load Schedule
	if config.LoadSchedule == "step" {
		opts = append(opts, runner.WithLoadSchedule("step"))
		opts = append(opts, runner.WithLoadStep(config.Step))
		stepDur, _ := time.ParseDuration(config.StepDuration)
		opts = append(opts, runner.WithLoadStepDuration(stepDur))
		// maxDur, _ := time.ParseDuration(config.MaxDuration)
		// opts = append(opts, runner.WithLoadMaxDuration(maxDur)) // Undefined
	} else if config.LoadSchedule == "linear" {
		opts = append(opts, runner.WithLoadSchedule("line"))
		stepDur, _ := time.ParseDuration(config.StepDuration)
		opts = append(opts, runner.WithLoadStepDuration(stepDur))
		// maxDur, _ := time.ParseDuration(config.MaxDuration)
		// opts = append(opts, runner.WithLoadMaxDuration(maxDur)) // Undefined
	} else {
		// Constant (Default)
		opts = append(opts, runner.WithRPS(uint(config.RPS)))
	}

	// Concurrency Schedule
	// Note: ghz runner handles concurrency logic slightly differently depending on schedule
	// For now, we assume basic concurrency
	if config.Concurrency > 0 {
		opts = append(opts, runner.WithConcurrency(uint(config.Concurrency)))
	}

	// Duration or Total Requests
	if config.TotalRequests > 0 {
		opts = append(opts, runner.WithTotalRequests(uint(config.TotalRequests)))
	} else if config.Duration != "" {
		dur, err := time.ParseDuration(config.Duration)
		if err == nil {
			opts = append(opts, runner.WithRunDuration(dur))
		}
	}

	// Target
	call := fmt.Sprintf("%s.%s", config.Service, config.Method)

	// Create report
	report, err := runner.Run(call, config.Host, opts...)
	if err != nil {
		return nil, fmt.Errorf("load test failed: %w", err)
	}

	return report, nil
}
