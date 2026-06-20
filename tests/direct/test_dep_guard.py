"""Direct-mode tests for the OSSure parametric insurance contract."""

from conftest import (
    CONTRACT, FEE_WALLET, FEE_BPS, GEN,
    mock_github, mock_verdict, addr_hex,
)

REPO = "openssl/openssl"
T0 = "2026-06-01T00:00:00Z"


def _deploy(direct_deploy):
    return direct_deploy(CONTRACT, FEE_WALLET, FEE_BPS)


# ---------------------------------------------------------------- underwriting
def test_underwrite_mints_first_shares_one_to_one(direct_vm, direct_deploy, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.sender = direct_bob
    direct_vm.value = 100 * GEN
    c.underwrite(REPO)

    pool = c.get_pool(REPO)
    assert pool["total_stake_wei"] == str(100 * GEN)
    assert pool["total_shares"] == str(100 * GEN)
    assert pool["available_wei"] == str(100 * GEN)
    assert c.get_shares(REPO, addr_hex(direct_bob)) == str(100 * GEN)


def test_underwrite_rejects_zero_value(direct_vm, direct_deploy, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.sender = direct_bob
    direct_vm.value = 0
    with direct_vm.expect_revert("stake must be positive"):
        c.underwrite(REPO)


# ------------------------------------------------------------------- coverage
def test_buy_policy_locks_capacity_and_accrues_premium(direct_vm, direct_deploy,
                                                        direct_alice, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.warp(T0)

    direct_vm.sender = direct_bob
    direct_vm.value = 100 * GEN
    c.underwrite(REPO)

    direct_vm.sender = direct_alice
    direct_vm.value = 1 * GEN  # premium
    c.buy_policy(REPO, 10 * GEN, 30)

    pool = c.get_pool(REPO)
    # premium minus 5% fee accrues to the pool stake; coverage is locked.
    assert pool["locked_wei"] == str(10 * GEN)
    expected_stake = 100 * GEN + (1 * GEN - (1 * GEN * FEE_BPS) // 10000)
    assert pool["total_stake_wei"] == str(expected_stake)
    assert pool["available_wei"] == str(expected_stake - 10 * GEN)

    pol = c.get_policy(REPO, addr_hex(direct_alice))
    assert pol["status"] == "ACTIVE"
    assert pol["coverage_wei"] == str(10 * GEN)


def test_buy_policy_rejects_over_capacity(direct_vm, direct_deploy,
                                          direct_alice, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.warp(T0)

    direct_vm.sender = direct_bob
    direct_vm.value = 5 * GEN
    c.underwrite(REPO)

    direct_vm.sender = direct_alice
    direct_vm.value = 1 * GEN
    with direct_vm.expect_revert("insufficient pool capacity"):
        c.buy_policy(REPO, 10 * GEN, 30)


# -------------------------------------------------------- claim adjudication
def test_claim_abandoned_pays_out_and_reduces_pool(direct_vm, direct_deploy,
                                                   direct_alice, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.warp(T0)

    direct_vm.sender = direct_bob
    direct_vm.value = 100 * GEN
    c.underwrite(REPO)

    direct_vm.sender = direct_alice
    direct_vm.value = 1 * GEN
    c.buy_policy(REPO, 10 * GEN, 30)

    mock_github(direct_vm, archived=True)
    mock_verdict(direct_vm, "abandoned", "repository archived")

    c.file_claim(REPO)

    pol = c.get_policy(REPO, addr_hex(direct_alice))
    assert pol["status"] == "PAID"
    assert pol["verdict"] == "abandoned"

    pool = c.get_pool(REPO)
    assert pool["locked_wei"] == "0"
    expected_stake = 100 * GEN + (1 * GEN - (1 * GEN * FEE_BPS) // 10000) - 10 * GEN
    assert pool["total_stake_wei"] == str(expected_stake)

    stats = c.get_stats()
    assert stats["paid_claims"] == 1


def test_claim_healthy_is_denied_and_keeps_coverage(direct_vm, direct_deploy,
                                                    direct_alice, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.warp(T0)

    direct_vm.sender = direct_bob
    direct_vm.value = 100 * GEN
    c.underwrite(REPO)

    direct_vm.sender = direct_alice
    direct_vm.value = 1 * GEN
    c.buy_policy(REPO, 10 * GEN, 30)

    mock_github(direct_vm, archived=False)
    mock_verdict(direct_vm, "healthy", "actively maintained")

    c.file_claim(REPO)

    pol = c.get_policy(REPO, addr_hex(direct_alice))
    assert pol["status"] == "ACTIVE"      # still in force
    assert pol["verdict"] == "healthy"

    pool = c.get_pool(REPO)
    assert pool["locked_wei"] == str(10 * GEN)  # coverage still reserved


def test_claim_requires_active_policy(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.warp(T0)
    direct_vm.sender = direct_bob
    direct_vm.value = 100 * GEN
    c.underwrite(REPO)

    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("policy not found"):
        c.file_claim(REPO)


# --------------------------------------------------------------- expiry path
def test_expire_policy_frees_capacity(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.warp(T0)

    direct_vm.sender = direct_bob
    direct_vm.value = 100 * GEN
    c.underwrite(REPO)

    direct_vm.sender = direct_alice
    direct_vm.value = 1 * GEN
    c.buy_policy(REPO, 10 * GEN, 30)

    # advance past expiry
    direct_vm.warp("2026-08-01T00:00:00Z")
    c.expire_policy(REPO, addr_hex(direct_alice))

    pol = c.get_policy(REPO, addr_hex(direct_alice))
    assert pol["status"] == "EXPIRED"
    pool = c.get_pool(REPO)
    assert pool["locked_wei"] == "0"


def test_claim_after_expiry_reverts(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.warp(T0)

    direct_vm.sender = direct_bob
    direct_vm.value = 100 * GEN
    c.underwrite(REPO)

    direct_vm.sender = direct_alice
    direct_vm.value = 1 * GEN
    c.buy_policy(REPO, 10 * GEN, 30)

    direct_vm.warp("2026-08-01T00:00:00Z")
    mock_github(direct_vm, archived=True)
    mock_verdict(direct_vm, "abandoned")
    with direct_vm.expect_revert("policy expired"):
        c.file_claim(REPO)


# ------------------------------------------------------------ withdraw stake
def test_withdraw_blocked_below_locked(direct_vm, direct_deploy, direct_alice, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.warp(T0)

    direct_vm.sender = direct_bob
    direct_vm.value = 100 * GEN
    c.underwrite(REPO)

    direct_vm.sender = direct_alice
    direct_vm.value = 1 * GEN
    c.buy_policy(REPO, 95 * GEN, 30)  # locks 95 of ~100.95

    # try to pull all 100 GEN worth of shares -> exceeds unlocked capacity
    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("exceeds unlocked capacity"):
        c.withdraw_stake(REPO, 100 * GEN)


def test_repo_normalization_rejects_bad_input(direct_vm, direct_deploy, direct_bob):
    c = _deploy(direct_deploy)
    direct_vm.sender = direct_bob
    direct_vm.value = 1 * GEN
    with direct_vm.expect_revert("owner/name"):
        c.underwrite("not-a-repo")
