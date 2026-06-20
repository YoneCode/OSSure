"""Shared fixtures and mock helpers for OSSure direct-mode tests.

Direct mode runs the leader function only (validator logic is exercised by
integration tests), so these helpers mock the two public GitHub endpoints the
contract reads plus the LLM classification call.
"""

import json

CONTRACT = "contracts/dep_guard.py"
FEE_WALLET = "0x" + "ab" * 20
FEE_BPS = 500  # 5%

GEN = 10**18  # 1 GEN in wei

# Distinct, non-overlapping URL patterns (re.search semantics).
REPO_URL = r"https://api\.github\.com/repos/[^/]+/[^/]+$"
RELEASES_URL = r"https://api\.github\.com/repos/[^/]+/[^/]+/releases/latest$"
LLM_PROMPT = r".*maintenance health.*"


def addr_hex(a) -> str:
    """Normalize a direct-mode address fixture (bytes or Address) to 0x-hex."""
    if isinstance(a, str):
        return a
    if hasattr(a, "as_hex"):
        return a.as_hex
    return "0x" + bytes(a).hex()


def mock_github(direct_vm, *, archived=False, pushed_at="2026-05-01T00:00:00Z",
                released_at="2026-05-15T00:00:00Z", releases_status=200):
    """Mock the GitHub repo + latest-release endpoints with stable fields."""
    direct_vm.mock_web(
        REPO_URL,
        {"status": 200, "body": json.dumps({
            "full_name": "owner/name",
            "archived": archived,
            "pushed_at": pushed_at,
        })},
    )
    if releases_status == 200:
        body = json.dumps({"tag_name": "v1.0.0", "published_at": released_at})
    else:
        body = json.dumps({"message": "Not Found"})
    direct_vm.mock_web(RELEASES_URL, {"status": releases_status, "body": body})


def mock_verdict(direct_vm, tier, reasoning="test"):
    """Mock the LLM classification response."""
    direct_vm.mock_llm(LLM_PROMPT, json.dumps({"tier": tier, "reasoning": reasoning}))
