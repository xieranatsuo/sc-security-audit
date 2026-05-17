// Package models defines data structures for the Go scanner.
package models

import "time"

// ScanRequest represents a request to scan a contract.
type ScanRequest struct {
	ContractAddress string `json:"contractAddress"`
	ChainID         int    `json:"chainId"`
	ChainName       string `json:"chainName"`
}

// ScanResult represents the result of scanning a single contract.
type ScanResult struct {
	ContractAddress string         `json:"contractAddress"`
	ChainID         int            `json:"chainId"`
	ChainName       string         `json:"chainName"`
	Findings        []Finding      `json:"findings"`
	RiskScore       float64        `json:"riskScore"`
	RiskLabel       string         `json:"riskLabel"`
	ScanDuration    time.Duration  `json:"scanDuration"`
	Error           string         `json:"error,omitempty"`
	BytecodeSize    int            `json:"bytecodeSize"`
	IsContract      bool           `json:"isContract"`
	GasPatterns     []GasPattern   `json:"gasPatterns"`
}

// Finding represents a single vulnerability finding.
type Finding struct {
	ID              string   `json:"id"`
	Title           string   `json:"title"`
	Description     string   `json:"description"`
	Severity        string   `json:"severity"`
	Score           float64  `json:"score"`
	Category        string   `json:"category"`
	CWEID           string   `json:"cweId,omitempty"`
	Location        string   `json:"location,omitempty"`
	Recommendation  string   `json:"recommendation,omitempty"`
	GasImpact       int      `json:"gasImpact,omitempty"`
}

// GasPattern represents a gas optimization opportunity.
type GasPattern struct {
	Pattern     string `json:"pattern"`
	Description string `json:"description"`
	Estimated   int    `json:"estimatedGasSaved"`
	Location    string `json:"location"`
}

// ScanConfig contains configuration for the scanner.
type ScanConfig struct {
	MaxConcurrency  int      `json:"maxConcurrency"`
	RPCURLs         map[string]string `json:"rpcUrls"`
	TimeoutSeconds  int      `json:"timeoutSeconds"`
	EnableGasAnalysis bool   `json:"enableGasAnalysis"`
}

// BatchScanResult represents results from a batch scan.
type BatchScanResult struct {
	TotalContracts int            `json:"totalContracts"`
	ScannedCount   int            `json:"scannedCount"`
	ErrorCount     int            `json:"errorCount"`
	Results        []ScanResult   `json:"results"`
	TotalDuration  time.Duration  `json:"totalDuration"`
	AvgRiskScore   float64        `json:"avgRiskScore"`
}
