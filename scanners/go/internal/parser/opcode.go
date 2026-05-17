// Package parser handles EVM bytecode parsing and opcode analysis.
package parser

import (
	"encoding/hex"
	"fmt"
	"strings"
)

// Opcode represents an EVM opcode.
type Opcode struct {
	Offset   int    `json:"offset"`
	Name     string `json:"name"`
	PushData string `json:"pushData,omitempty"`
}

// Known opcodes.
var opcodeNames = map[byte]string{
	0x00: "STOP", 0x01: "ADD", 0x02: "MUL", 0x03: "SUB",
	0x04: "DIV", 0x05: "SDIV", 0x06: "MOD", 0x07: "SMOD",
	0x10: "LT", 0x11: "GT", 0x14: "EQ", 0x15: "ISZERO",
	0x16: "AND", 0x17: "OR", 0x18: "XOR", 0x19: "NOT",
	0x1b: "SHL", 0x1c: "SHR",
	0x20: "SHA3",
	0x30: "ADDRESS", 0x31: "BALANCE", 0x32: "ORIGIN",
	0x33: "CALLER", 0x34: "CALLVALUE", 0x35: "CALLDATALOAD",
	0x36: "CALLDATASIZE", 0x3b: "EXTCODESIZE",
	0x40: "BLOCKHASH", 0x41: "COINBASE", 0x42: "TIMESTAMP",
	0x43: "NUMBER", 0x44: "DIFFICULTY", 0x45: "GASLIMIT",
	0x46: "CHAINID", 0x47: "SELFBALANCE",
	0x50: "POP", 0x51: "MLOAD", 0x52: "MSTORE",
	0x54: "SLOAD", 0x55: "SSTORE",
	0x56: "JUMP", 0x57: "JUMPI", 0x58: "PC", 0x5b: "JUMPDEST",
	0xf0: "CREATE", 0xf1: "CALL", 0xf2: "CALLCODE",
	0xf3: "RETURN", 0xf4: "DELEGATECALL", 0xf5: "CREATE2",
	0xfa: "STATICCALL", 0xfd: "REVERT", 0xfe: "INVALID", 0xff: "SELFDESTRUCT",
}

// Disassemble parses EVM bytecode into opcodes.
func Disassemble(bytecodeHex string) ([]Opcode, error) {
	bytecodeHex = strings.TrimPrefix(bytecodeHex, "0x")
	if len(bytecodeHex)%2 != 0 {
		return nil, fmt.Errorf("invalid bytecode length")
	}

	data, err := hex.DecodeString(bytecodeHex)
	if err != nil {
		return nil, fmt.Errorf("invalid hex: %w", err)
	}

	var instructions []Opcode
	i := 0
	for i < len(data) {
		op := Opcode{Offset: i}
		byte := data[i]

		name, ok := opcodeNames[byte]
		if !ok {
			name = fmt.Sprintf("UNKNOWN(0x%02x)", byte)
		}
		op.Name = name

		// PUSH1-PUSH32
		if byte >= 0x60 && byte <= 0x7f {
			pushSize := int(byte) - 0x5f
			if i+pushSize < len(data) {
				op.PushData = hex.EncodeToString(data[i+1 : i+1+pushSize])
			}
			i += 1 + pushSize
		} else {
			i++
		}

		instructions = append(instructions, op)
	}

	return instructions, nil
}

// IsDangerous checks if an opcode is a security-relevant opcode.
func IsDangerous(name string) (bool, string) {
	dangerous := map[string]string{
		"CALL":          "external_call",
		"DELEGATECALL":  "delegatecall",
		"STATICCALL":    "static_call",
		"CALLCODE":      "callcode",
		"SELFDESTRUCT":  "selfdestruct",
		"CREATE":        "create",
		"CREATE2":       "create2",
		"SSTORE":        "state_change",
		"SLOAD":         "state_read",
		"TIMESTAMP":     "timestamp_dep",
		"BLOCKHASH":     "blockhash_dep",
	}

	if category, ok := dangerous[name]; ok {
		return true, category
	}
	return false, ""
}

// CountOpcode counts occurrences of a specific opcode.
func CountOpcode(instructions []Opcode, name string) int {
	count := 0
	for _, op := range instructions {
		if op.Name == name {
			count++
		}
	}
	return count
}

// FindOpcodeSequences finds dangerous opcode sequences.
func FindOpcodeSequences(instructions []Opcode, sequence []string) [][]int {
	var results [][]int
	for i := 0; i <= len(instructions)-len(sequence); i++ {
		match := true
		for j, name := range sequence {
			if instructions[i+j].Name != name {
				match = false
				break
			}
		}
		if match {
			results = append(results, []int{i, i + len(sequence) - 1})
		}
	}
	return results
}
