// Package scanner provides concurrent multi-contract scanning.
package scanner

import (
	"context"
	"fmt"
	"sync"
	"time"

	"smart-contract-audit-platform/scanner/internal/parser"
	"smart-contract-audit-platform/scanner/pkg/models"
)

// Scanner performs concurrent contract analysis.
type Scanner struct {
	config models.ScanConfig
	mu     sync.Mutex
}

// New creates a new Scanner with the given configuration.
func New(config models.ScanConfig) *Scanner {
	if config.MaxConcurrency <= 0 {
		config.MaxConcurrency = 10
	}
	if config.TimeoutSeconds <= 0 {
		config.TimeoutSeconds = 30
	}
	return &Scanner{config: config}
}

// ScanBatch scans multiple contracts concurrently.
func (s *Scanner) ScanBatch(ctx context.Context, requests []models.ScanRequest) models.BatchScanResult {
	startTime := time.Now()

	result := models.BatchScanResult{
		TotalContracts: len(requests),
		Results:        make([]models.ScanResult, len(requests)),
	}

	// Semaphore for concurrency control
	sem := make(chan struct{}, s.config.MaxConcurrency)
	var wg sync.WaitGroup

	for i, req := range requests {
		wg.Add(1)
		go func(idx int, request models.ScanRequest) {
			defer wg.Done()

			// Acquire semaphore
			sem <- struct{}{}
			defer func() { <-sem }()

			scanResult := s.scanSingle(ctx, request)

			s.mu.Lock()
			result.Results[idx] = scanResult
			if scanResult.Error != "" {
				result.ErrorCount++
			} else {
				result.ScannedCount++
			}
			s.mu.Unlock()
		}(i, req)
	}

	wg.Wait()
	result.TotalDuration = time.Since(startTime)

	// Calculate average risk score
	totalRisk := 0.0
	validScans := 0
	for _, r := range result.Results {
		if r.Error == "" {
			totalRisk += r.RiskScore
			validScans++
		}
	}
	if validScans > 0 {
		result.AvgRiskScore = totalRisk / float64(validScans)
	}

	return result
}

// scanSingle scans a single contract.
func (s *Scanner) scanSingle(ctx context.Context, req models.ScanRequest) models.ScanResult {
	startTime := time.Now()

	result := models.ScanResult{
		ContractAddress: req.ContractAddress,
		ChainID:         req.ChainID,
		ChainName:       req.ChainName,
	}

	// Get bytecode from RPC
	bytecode, err := s.getBytecode(ctx, req.ChainName, req.ContractAddress)
	if err != nil {
		result.Error = fmt.Sprintf("failed to get bytecode: %v", err)
		result.ScanDuration = time.Since(startTime)
		return result
	}

	result.BytecodeSize = len(bytecode) / 2 // hex to bytes
	result.IsContract = len(bytecode) > 4   // empty contract = "0x"

	if !result.IsContract {
		result.Error = "address is not a contract (no bytecode)"
		result.ScanDuration = time.Since(startTime)
		return result
	}

	// Disassemble bytecode
	instructions, err := parser.Disassemble(bytecode)
	if err != nil {
		result.Error = fmt.Sprintf("failed to disassemble: %v", err)
		result.ScanDuration = time.Since(startTime)
		return result
	}

	// Analyze bytecode patterns
	findings := s.analyzeBytecode(instructions, req.ContractAddress)
	result.Findings = findings

	// Analyze gas patterns
	if s.config.EnableGasAnalysis {
		result.GasPatterns = s.analyzeGasPatterns(instructions)
	}

	// Calculate risk score
	result.RiskScore = s.calculateRiskScore(findings)
	result.RiskLabel = riskLabel(result.RiskScore)
	result.ScanDuration = time.Since(startTime)

	return result
}

// getBytecode fetches contract bytecode from an RPC endpoint.
func (s *Scanner) getBytecode(ctx context.Context, chain string, address string) (string, error) {
	// In production, this would make a JSON-RPC call to eth_getCode
	// For now, returns bytecode from the configured RPC endpoint
	rpcURL, ok := s.config.RPCURLs[chain]
	if !ok {
		return "", fmt.Errorf("no RPC URL for chain: %s", chain)
	}

	// TODO: Implement actual RPC call
	// For now, return empty to indicate this needs RPC integration
	_ = rpcURL
	return "", fmt.Errorf("RPC integration not implemented")
}

// analyzeBytecode performs security analysis on disassembled bytecode.
func (s *Scanner) analyzeBytecode(instructions []parser.Opcode, address string) []models.Finding {
	var findings []models.Finding

	// Check for SELFDESTRUCT
	selfdestructCount := parser.CountOpcode(instructions, "SELFDESTRUCT")
	if selfdestructCount > 0 {
		findings = append(findings, models.Finding{
			ID:          "BYTECODE_0001",
			Title:       "SELFDESTRUCT Opcode Found",
			Description: fmt.Sprintf("Contract contains %d SELFDESTRUCT instruction(s). This allows the contract to be destroyed and all remaining ETH sent to an arbitrary address.", selfdestructCount),
			Severity:    "high",
			Score:       7.0,
			Category:    "Self-Destruct",
			CWEID:       "CWE-672",
			Recommendation: "Remove SELFDESTRUCT unless contract upgradeability requires it. If needed, add strict access control.",
		})
	}

	// Check for DELEGATECALL
	delegatecallCount := parser.CountOpcode(instructions, "DELEGATECALL")
	if delegatecallCount > 0 {
		// Check if there's a guard (JUMPI before DELEGATECALL)
		hasGuard := false
		for i, op := range instructions {
			if op.Name == "DELEGATECALL" && i > 0 && instructions[i-1].Name == "JUMPI" {
				hasGuard = true
				break
			}
		}

		if !hasGuard {
			findings = append(findings, models.Finding{
				ID:          "BYTECODE_0002",
				Title:       "Unguarded DELEGATECALL",
				Description: fmt.Sprintf("Contract has %d DELEGATECALL instruction(s) without apparent access control.", delegatecallCount),
				Severity:    "critical",
				Score:       9.0,
				Category:    "Delegatecall",
				CWEID:       "CWE-250",
				Recommendation: "Ensure DELEGATECALL can only be called by authorized addresses.",
			})
		}
	}

	// Check for TIMESTAMP dependency
	timestampCount := parser.CountOpcode(instructions, "TIMESTAMP")
	if timestampCount > 2 {
		findings = append(findings, models.Finding{
			ID:          "BYTECODE_0003",
			Title:       "Heavy TIMESTAMP Usage",
			Description: fmt.Sprintf("Contract uses TIMESTAMP %d times. Miners can manipulate block.timestamp within ~15 seconds.", timestampCount),
			Severity:    "low",
			Score:       3.0,
			Category:    "Timestamp Dependency",
			CWEID:       "CWE-829",
			Recommendation: "Avoid using block.timestamp for critical logic. Use block numbers or oracles for time-sensitive operations.",
		})
	}

	// Check for CALL without return value check
	callSequences := parser.FindOpcodeSequences(instructions, []string{"CALL", "POP"})
	if len(callSequences) > 0 {
		findings = append(findings, models.Finding{
			ID:          "BYTECODE_0004",
			Title:       "Unchecked External Call Return Value",
			Description: fmt.Sprintf("Found %d instance(s) where CALL is immediately followed by POP (discarding return value).", len(callSequences)),
			Severity:    "medium",
			Score:       5.0,
			Category:    "Unchecked Call",
			CWEID:       "CWE-252",
			Recommendation: "Always check the return value of external calls.",
		})
	}

	return findings
}

// analyzeGasPatterns identifies gas optimization opportunities.
func (s *Scanner) analyzeGasPatterns(instructions []parser.Opcode) []models.GasPattern {
	var patterns []models.GasPattern

	// Check for SSTORE after SLOAD (could use transient storage)
	sloadPositions := make(map[int]bool)
	for i, op := range instructions {
		if op.Name == "SLOAD" {
			sloadPositions[i] = true
		}
		if op.Name == "SSTORE" && i > 0 && sloadPositions[i-2] {
			patterns = append(patterns, models.GasPattern{
				Pattern:     "sload_before_sstore",
				Description: "SLOAD immediately before SSTORE. Consider using transient storage (EIP-1153) if available.",
				Estimated:   2100,
				Location:    fmt.Sprintf("offset %d-%d", instructions[i-2].Offset, op.Offset),
			})
		}
	}

	// Check for multiple CALLs to same address (could batch)
	callTargets := make(map[string]int)
	for _, op := range instructions {
		if op.Name == "CALL" && op.PushData != "" {
			callTargets[op.PushData]++
		}
	}
	for target, count := range callTargets {
		if count > 2 {
			patterns = append(patterns, models.GasPattern{
				Pattern:     "repeated_calls",
				Description: fmt.Sprintf("Multiple CALLs to target %s. Consider batching calls.", target[:8]+"..."),
				Estimated:   count * 100,
			})
		}
	}

	return patterns
}

// calculateRiskScore computes a risk score from findings.
func (s *Scanner) calculateRiskScore(findings []models.Finding) float64 {
	if len(findings) == 0 {
		return 0
	}

	totalScore := 0.0
	maxScore := 0.0
	for _, f := range findings {
		totalScore += f.Score
		if f.Score > maxScore {
			maxScore = f.Score
		}
	}

	// Weighted combination: 60% max severity, 40% average
	avgScore := totalScore / float64(len(findings))
	return 0.6*maxScore + 0.4*avgScore
}

// riskLabel returns a human-readable risk label.
func riskLabel(score float64) string {
	switch {
	case score >= 8.0:
		return "CRITICAL"
	case score >= 6.0:
		return "HIGH"
	case score >= 4.0:
		return "MEDIUM"
	case score >= 2.0:
		return "LOW"
	default:
		return "INFORMATIONAL"
	}
}
