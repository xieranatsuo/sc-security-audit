"""Python core tests — risk scoring, severity classification, opcodes."""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from scanners.python.core.risk import (
    RiskInput, calculate_risk_score, validate_weights,
    risk_label, risk_color, normalize_score, DEFAULT_WEIGHTS,
)
from scanners.python.core.severity import (
    SeverityLevel, Vulnerability, classify_severity,
    get_severity_color, get_severity_description,
)
from scanners.python.core.opcodes import (
    OPCODES, disassemble, is_dangerous, get_opcode_name,
)


def test_validate_weights_valid():
    """Weights summing to 1.0 should pass."""
    assert validate_weights(DEFAULT_WEIGHTS) is True


def test_validate_weights_invalid():
    """Weights not summing to 1.0 should raise ValueError."""
    try:
        validate_weights({'a': 0.5, 'b': 0.3})
        assert False, "Should have raised ValueError"
    except ValueError:
        pass


def test_calculate_risk_score_basic():
    """Basic risk score calculation should work."""
    inputs = RiskInput(
        severity=0.5,
        exploitability=0.5,
        attack_complexity=0.5,
        impact=0.5,
        detection_difficulty=0.5,
    )
    result = calculate_risk_score(inputs)
    assert 40 <= result['score'] <= 60
    assert 'breakdown' in result
    assert 'formula' in result


def test_calculate_risk_score_max():
    """All factors at 1.0 should yield score near 100."""
    inputs = RiskInput(
        severity=1.0,
        exploitability=1.0,
        attack_complexity=1.0,
        impact=1.0,
        detection_difficulty=1.0,
    )
    result = calculate_risk_score(inputs)
    assert result['score'] == 100.0


def test_calculate_risk_score_min():
    """All factors at 0.0 should yield score of 0."""
    inputs = RiskInput(
        severity=0.0,
        exploitability=0.0,
        attack_complexity=0.0,
        impact=0.0,
        detection_difficulty=0.0,
    )
    result = calculate_risk_score(inputs)
    assert result['score'] == 0.0


def test_classify_severity_critical():
    assert classify_severity(9.5) == SeverityLevel.CRITICAL


def test_classify_severity_high():
    assert classify_severity(7.5) == SeverityLevel.HIGH


def test_classify_severity_medium():
    assert classify_severity(5.0) == SeverityLevel.MEDIUM


def test_classify_severity_low():
    assert classify_severity(2.5) == SeverityLevel.LOW


def test_classify_severity_informational():
    assert classify_severity(0.5) == SeverityLevel.INFORMATIONAL


def test_risk_label():
    assert risk_label(85) == 'CRITICAL'
    assert risk_label(65) == 'HIGH'
    assert risk_label(45) == 'MEDIUM'
    assert risk_label(25) == 'LOW'
    assert risk_label(5) == 'INFORMATIONAL'


def test_risk_color():
    assert risk_color(85) == '#dc2626'
    assert risk_color(65) == '#ea580c'
    assert risk_color(45) == '#ca8a04'
    assert risk_color(25) == '#16a34a'
    assert risk_color(5) == '#6b7280'


def test_normalize_score():
    assert normalize_score(5, 0, 10) == 0.5
    assert normalize_score(0, 0, 10) == 0.0
    assert normalize_score(10, 0, 10) == 1.0


def test_disassemble_simple():
    """Disassemble simple STOP bytecode."""
    instructions = disassemble('00')
    assert len(instructions) == 1
    assert instructions[0][1] == 'STOP'


def test_disassemble_push():
    """Disassemble PUSH1 0x60."""
    instructions = disassemble('6060')
    assert len(instructions) == 1
    assert instructions[0][1] == 'PUSH1'
    assert instructions[0][2] == '60'


def test_is_dangerous():
    is_d, pattern = is_dangerous('CALL')
    assert is_d is True
    assert pattern == 'external_call'

    is_d, _ = is_dangerous('ADD')
    assert is_d is False


def test_get_opcode_name():
    assert get_opcode_name(0x00) == 'STOP'
    assert get_opcode_name(0x50) == 'POP'
    assert get_opcode_name(0xf1) == 'CALL'


def test_vulnerability_to_dict():
    v = Vulnerability(
        id='TEST_001',
        title='Test Vulnerability',
        description='Test description',
        severity=SeverityLevel.HIGH,
        score=7.5,
        category='Test',
        cwe_id='CWE-000',
    )
    d = v.to_dict()
    assert d['id'] == 'TEST_001'
    assert d['severity'] == 'high'
    assert d['score'] == 7.5


# Run all tests
if __name__ == '__main__':
    tests = [v for k, v in globals().items() if k.startswith('test_')]
    passed = 0
    failed = 0
    for test in tests:
        try:
            test()
            print(f"  PASS: {test.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL: {test.__name__} — {e}")
            failed += 1

    print(f"\n{'='*40}")
    print(f"Results: {passed} passed, {failed} failed")
    if failed > 0:
        sys.exit(1)
