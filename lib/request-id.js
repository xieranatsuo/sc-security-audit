/**
 * Deterministic request ID generator.
 * Uses timestamp + atomic counter — deterministic ID generation.
 */
let _counter = 0;
export function generateRequestId(prefix = 'req') {
  _counter = (_counter + 1) % 1_000_000;
  return `${prefix}_${Date.now().toString(36)}_${_counter.toString(36).padStart(4, '0')}`;
}
