package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"smart-contract-audit/scanners/go/internal/scanner"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: scanner <json-input-file>")
		fmt.Println("  Input: array of {address, chain, hexCode}")
		os.Exit(1)
	}

	data, err := os.ReadFile(os.Args[1])
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading input: %v\n", err)
		os.Exit(1)
	}

	var contracts []scanner.ContractInput
	if err := json.Unmarshal(data, &contracts); err != nil {
		fmt.Fprintf(os.Stderr, "Error parsing JSON: %v\n", err)
		os.Exit(1)
	}

	s := scanner.NewBytecodeScanner(5, 10*time.Second)
	ctx := context.Background()
	results := s.ScanBatch(ctx, contracts)

	summary := scanner.Summary(results)
	output := map[string]interface{}{
		"results": results,
		"summary": summary,
	}

	jsonOutput, _ := json.MarshalIndent(output, "", "  ")
	fmt.Println(string(jsonOutput))
}
