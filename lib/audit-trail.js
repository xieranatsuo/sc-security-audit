/**
 * Audit trail logger.
 * Records every step of the audit process for reproducibility.
 * Each audit gets a unique ID and all steps are timestamped.
 */

export class AuditTrail {
  constructor(auditId, contractAddress, chainId) {
    this.auditId = auditId;
    this.contractAddress = contractAddress;
    this.chainId = chainId;
    this.steps = [];
    this.startTime = Date.now();
  }

  /**
   * Record an audit step.
   * @param {string} phase - Phase name (fetch, analyze, score, report)
   * @param {string} action - What was done
   * @param {object} details - Additional details
   */
  log(phase, action, details = {}) {
    this.steps.push({
      timestamp: new Date().toISOString(),
      phase,
      action,
      elapsed: Date.now() - this.startTime,
      ...details,
    });
  }

  /**
   * Record an error in the audit trail.
   */
  error(phase, action, error) {
    this.log(phase, action, {
      status: 'error',
      error: error.message || String(error),
    });
  }

  /**
   * Get the full audit trail as a serializable object.
   */
  toObject() {
    return {
      auditId: this.auditId,
      contractAddress: this.contractAddress,
      chainId: this.chainId,
      startTime: new Date(this.startTime).toISOString(),
      endTime: new Date().toISOString(),
      totalElapsed: Date.now() - this.startTime,
      stepCount: this.steps.length,
      steps: this.steps,
    };
  }

  /**
   * Get a summary of the audit trail.
   */
  summary() {
    const errors = this.steps.filter((s) => s.status === 'error');
    return {
      auditId: this.auditId,
      steps: this.steps.length,
      errors: errors.length,
      duration: Date.now() - this.startTime,
      phases: [...new Set(this.steps.map((s) => s.phase))],
    };
  }
}

/**
 * Generate a unique audit ID.
 */
export function generateAuditId(address, chainId) {
  const timestamp = Date.now().toString(36);
  const hash = `${address}_${chainId}_${timestamp}`;
  return `audit_${hash.slice(0, 32)}`;
}
