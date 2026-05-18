package scanner

import (
	"context"
	"encoding/hex"
	"fmt"
	"strings"
	"sync"
	"time"
)

// ScanResult holds the result of scanning a single contract's bytecode
type ScanResult struct {
	Address     string   `json:"address"`
	Chain       string   `json:"chain"`
	BytecodeLen int      `json:"bytecodeLen"`
	Opcodes     []string `json:"opcodes"`
	RiskFlags   []string `json:"riskFlags"`
	RiskLevel   string   `json:"riskLevel"`
	ScanTimeMs  int64    `json:"scanTimeMs"`
	Error       string   `json:"error,omitempty"`
}

// BytecodeScanner performs concurrent bytecode analysis across multiple contracts
type BytecodeScanner struct {
	workers int
	timeout time.Duration
}

// NewBytecodeScanner creates a scanner with configurable concurrency
func NewBytecodeScanner(workers int, timeout time.Duration) *BytecodeScanner {
	if workers <= 0 {
		workers = 5
	}
	if timeout <= 0 {
		timeout = 10 * time.Second
	}
	return &BytecodeScanner{
		workers: workers,
		timeout: timeout,
	}
}

// ScanBatch scans multiple contract bytecodes concurrently using goroutines
func (s *BytecodeScanner) ScanBatch(ctx context.Context, contracts []ContractInput) []ScanResult {
	results := make([]ScanResult, len(contracts))
	var wg sync.WaitGroup
	sem := make(chan struct{}, s.workers)

	for i, contract := range contracts {
		wg.Add(1)
		sem <- struct{}{}
		go func(idx int, c ContractInput) {
			defer wg.Done()
			defer func() { <-sem }()

			scanCtx, cancel := context.WithTimeout(ctx, s.timeout)
			defer cancel()

			results[idx] = s.scanSingle(scanCtx, c)
		}(i, contract)
	}

	wg.Wait()
	return results
}

// ContractInput represents a contract to scan
type ContractInput struct {
	Address string `json:"address"`
	Chain   string `json:"chain"`
	HexCode string `json:"hexCode"`
}

// scanSingle analyzes a single contract's bytecode for risk patterns
func (s *BytecodeScanner) scanSingle(ctx context.Context, contract ContractInput) ScanResult {
	start := time.Now()
	result := ScanResult{
		Address: contract.Address,
		Chain:   contract.Chain,
	}

	select {
	case <-ctx.Done():
		result.Error = "scan timeout: " + ctx.Err().Error()
		result.RiskLevel = "unknown"
		return result
	default:
	}

	if contract.HexCode == "" || contract.HexCode == "0x" {
		result.Error = "empty bytecode — contract may be destroyed or not deployed"
		result.RiskLevel = "unknown"
		return result
	}

	// Strip 0x prefix
	code := strings.TrimPrefix(contract.HexCode, "0x")
	raw, err := hex.DecodeString(code)
	if err != nil {
		result.Error = "invalid hex bytecode"
		result.RiskLevel = "unknown"
		return result
	}

	result.BytecodeLen = len(raw)
	result.Opcodes = parseOpcodes(raw)
	result.RiskFlags = detectRiskFlags(result.Opcodes)
	result.RiskLevel = classifyRisk(result.RiskFlags)
	result.ScanTimeMs = time.Since(start).Milliseconds()

	return result
}

// parseOpcodes extracts opcode names from raw bytecode
func parseOpcodes(bytecode []byte) []string {
	var opcodes []string
	i := 0
	for i < len(bytecode) {
		op := bytecode[i]
		name, ok := opcodeNames[op]
		if !ok {
			name = fmt.Sprintf("UNKNOWN(0x%02x)", op)
		}
		opcodes = append(opcodes, name)

		// PUSH1-PUSH32 have inline data
		if op >= 0x60 && op <= 0x7f {
			pushLen := int(op - 0x5f)
			i += 1 + pushLen
		} else {
			i++
		}

		// Safety: cap at 10000 opcodes to prevent memory issues
		if len(opcodes) > 10000 {
			break
		}
	}
	return opcodes
}

// detectRiskFlags checks for dangerous opcode patterns
func detectRiskFlags(opcodes []string) []string {
	var flags []string
	opcodeStr := strings.Join(opcodes, " ")

	if strings.Contains(opcodeStr, "SELFDESTRUCT") {
		flags = append(flags, "SELFDESTRUCT: contract can be permanently destroyed")
	}
	if strings.Contains(opcodeStr, "DELEGATECALL") {
		flags = append(flags, "DELEGATECALL: executes code in caller context — verify target is trusted")
	}
	if strings.Contains(opcodeStr, "CALL") && strings.Contains(opcodeStr, "SSTORE") {
		// Check if SSTORE appears after CALL (potential reentrancy)
		callIdx := strings.Index(opcodeStr, "CALL")
		sstoreIdx := strings.Index(opcodeStr, "SSTORE")
		if sstoreIdx > callIdx {
			flags = append(flags, "REENTRANCY_RISK: SSTORE after CALL — state change after external call")
		}
	}
	if strings.Contains(opcodeStr, "ORIGIN") {
		flags = append(flags, "TXORIGIN: uses tx.origin for authentication — vulnerable to phishing")
	}
	if strings.Contains(opcodeStr, "PC") && strings.Contains(opcodeStr, "JUMP") {
		flags = append(flags, "DYNAMIC_JUMP: computed jump destination — harder to audit")
	}

	return flags
}

// classifyRisk assigns a risk level based on detected flags
func classifyRisk(flags []string) string {
	if len(flags) == 0 {
		return "low"
	}
	for _, f := range flags {
		if strings.Contains(f, "SELFDESTRUCT") || strings.Contains(f, "REENTRANCY") {
			return "critical"
		}
		if strings.Contains(f, "DELEGATECALL") || strings.Contains(f, "TXORIGIN") {
			return "high"
		}
	}
	return "medium"
}

// opcodeNames maps EVM opcode bytes to human-readable names
var opcodeNames = map[byte]string{
	0x00: "STOP", 0x01: "ADD", 0x02: "MUL", 0x03: "SUB", 0x04: "DIV",
	0x05: "SDIV", 0x06: "MOD", 0x07: "SMOD", 0x08: "ADDMOD", 0x09: "MULMOD",
	0x0a: "EXP", 0x0b: "SIGNEXTEND",
	0x10: "LT", 0x11: "GT", 0x12: "SLT", 0x13: "SGT", 0x14: "EQ",
	0x15: "ISZERO", 0x16: "AND", 0x17: "OR", 0x18: "XOR", 0x19: "NOT",
	0x1a: "BYTE", 0x1b: "SHL", 0x1c: "SHR", 0x1d: "SAR",
	0x20: "SHA3",
	0x30: "ADDRESS", 0x31: "BALANCE", 0x32: "ORIGIN", 0x33: "CALLER",
	0x34: "CALLVALUE", 0x35: "CALLDATALOAD", 0x36: "CALLDATASIZE",
	0x37: "CALLDATACOPY", 0x38: "CODESIZE", 0x39: "CODECOPY",
	0x3a: "GASPRICE", 0x3b: "EXTCODESIZE", 0x3c: "EXTCODECOPY",
	0x3d: "RETURNDATASIZE", 0x3e: "RETURNDATACOPY", 0x3f: "EXTCODEHASH",
	0x40: "BLOCKHASH", 0x41: "COINBASE", 0x42: "TIMESTAMP", 0x43: "NUMBER",
	0x44: "DIFFICULTY", 0x45: "GASLIMIT", 0x46: "CHAINID", 0x47: "SELFBALANCE",
	0x50: "POP", 0x51: "MLOAD", 0x52: "MSTORE", 0x53: "MSTORE8",
	0x54: "SLOAD", 0x55: "SSTORE", 0x56: "JUMP", 0x57: "JUMPI",
	0x58: "PC", 0x59: "MSIZE", 0x5a: "GAS", 0x5b: "JUMPDEST",
	0xf0: "CREATE", 0xf1: "CALL", 0xf2: "CALLCODE", 0xf3: "RETURN",
	0xf4: "DELEGATECALL", 0xf5: "CREATE2", 0xfa: "STATICCALL",
	0xfd: "REVERT", 0xfe: "INVALID", 0xff: "SELFDESTRUCT",
}

// IsEmpty checks if the scanner has no results
func (s *BytecodeScanner) IsEmpty(results []ScanResult) bool {
	return len(results) == 0
}

// Summary returns a human-readable summary of scan results
func Summary(results []ScanResult) map[string]int {
	summary := map[string]int{
		"total":    len(results),
		"low":      0,
		"medium":   0,
		"high":     0,
		"critical": 0,
		"unknown":  0,
		"errors":   0,
	}
	for _, r := range results {
		summary[r.RiskLevel]++
		if r.Error != "" {
			summary["errors"]++
		}
	}
	return summary
}
