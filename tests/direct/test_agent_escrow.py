import json


CONTRACT = "contracts/AgentEscrowContract.py"
PAYMENT = 50_000_000_000_000_000


def _deploy(direct_deploy):
    return direct_deploy(CONTRACT)


def test_seeds_marketplace_and_demo_agreement(direct_deploy):
    contract = _deploy(direct_deploy)
    stats = contract.get_protocol_stats()
    assert stats["agent_count"] == 6
    assert stats["total_agreements"] == 1
    demo = contract.get_agreement("48291")
    assert demo["status"] == "COMPLETED"
    assert demo["result"] == "SUCCESS"
    assert demo["client_name"] == "StartupAgent"
    assert demo["provider_name"] == "SecurityAudit-Agent"
    agent = contract.get_agent_by_name("SecurityAudit-Agent")
    assert agent["trust_level"] == "A+"
    assert agent["completed_jobs"] == 243
    cert = contract.get_certificate("48291")
    assert cert["result"] == "VERIFIED"
    assert cert["consensus"] == "12/12"


def test_create_accept_start_and_submit_evidence(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = _deploy(direct_deploy)
    direct_vm.sender = direct_alice
    direct_vm.value = PAYMENT
    contract.create_agreement(
        direct_bob,
        "StartupAgent",
        "SecurityAudit-Agent",
        "Audit Solidity contract",
        "- Find vulnerabilities\n- Provide report",
        "GitHub repository and audit report",
        "24 hours",
        PAYMENT,
    )
    aid = contract.get_agreement_id_at(1)
    item = contract.get_agreement(aid)
    assert item["status"] == "CREATED"
    assert int(item["payment"]) == PAYMENT
    assert int(item["locked"]) == PAYMENT

    direct_vm.value = 0
    with direct_vm.prank(direct_alice):
        with direct_vm.expect_revert():
            contract.accept_agreement(aid)

    direct_vm.sender = direct_bob
    contract.accept_agreement(aid)
    assert contract.get_agreement(aid)["status"] == "ACCEPTED"

    contract.start_work(aid)
    assert contract.get_agreement(aid)["status"] == "IN_PROGRESS"

    contract.submit_evidence(
        aid,
        "https://github.com/agentescrow/demo-audit",
        "https://github.com/agentescrow/demo-audit",
        "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
        "forge test\nAll tests passed",
        "",
        "Security audit completed successfully",
    )
    submitted = contract.get_agreement(aid)
    assert submitted["status"] == "EVIDENCE_SUBMITTED"
    assert submitted["claim"] == "Security audit completed successfully"


def test_rejects_self_deal_and_zero_payment(direct_vm, direct_deploy, direct_alice):
    contract = _deploy(direct_deploy)
    direct_vm.sender = direct_alice
    with direct_vm.expect_revert():
        contract.create_agreement(
            direct_alice,
            "Client",
            "Provider",
            "Task",
            "Req",
            "Evidence",
            "24 hours",
            PAYMENT,
        )
    with direct_vm.expect_revert():
        contract.create_agreement(
            "0x2222222222222222222222222222222222222222",
            "Client",
            "Provider",
            "Task",
            "Req",
            "Evidence",
            "24 hours",
            0,
        )


def test_submit_evidence_requires_independent_source(direct_vm, direct_deploy, direct_alice, direct_bob):
    contract = _deploy(direct_deploy)
    direct_vm.sender = direct_alice
    contract.create_agreement(
        direct_bob,
        "ClientAgent",
        "ProviderAgent",
        "Task",
        "Requirements",
        "GitHub evidence",
        "24 hours",
        PAYMENT,
    )
    aid = contract.get_agreement_id_at(1)
    direct_vm.sender = direct_bob
    contract.accept_agreement(aid)
    with direct_vm.expect_revert():
        contract.submit_evidence(aid, "", "", "", "logs", "", "done")


def test_verification_success_settles_and_updates_reputation(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = _deploy(direct_deploy)
    direct_vm.sender = direct_alice
    contract.create_agreement(
        direct_bob,
        "StartupAgent",
        "SecurityAudit-Agent",
        "Audit Solidity contract",
        "Find vulnerabilities and provide a report",
        "GitHub repository",
        "24 hours",
        PAYMENT,
    )
    before = contract.get_agent(direct_bob)
    aid = contract.get_agreement_id_at(1)
    direct_vm.sender = direct_bob
    contract.accept_agreement(aid)
    contract.submit_evidence(
        aid,
        "https://example.com/audit-report",
        "",
        "",
        "untrusted logs",
        "",
        "Security audit completed successfully",
    )

    body = (
        "Independent audit report for the Solidity contract. "
        "Critical and high severity findings documented with remediation. "
        "Requirements satisfied. Task complete."
    )
    direct_vm.mock_web(r".*example\.com/audit-report.*", {"status": 200, "body": body})
    direct_vm.mock_llm(
        r".*GenLayer validator judging.*",
        json.dumps(
            {
                "evidence_exists": True,
                "matches_requirements": True,
                "task_completed": True,
                "claim_supported": True,
            }
        ),
    )

    direct_vm.sender = direct_alice
    contract.request_verification(aid)
    item = contract.get_agreement(aid)
    assert item["status"] == "COMPLETED"
    assert item["result"] == "SUCCESS"
    assert item["settled"] is True
    after = contract.get_agent(direct_bob)
    assert after["completed_jobs"] == before["completed_jobs"] + 1
    assert after["successful_jobs"] == before["successful_jobs"] + 1
    assert after["certificates"] == before["certificates"] + 1
    cert = contract.get_certificate(aid)
    assert cert["result"] == "VERIFIED"
    verdict = json.loads(item["verdict_json"])
    assert verdict["result"] == "SUCCESS"
    assert verdict["fetch_ok"] is True


def test_hash_mismatch_fails_and_decrements_reputation(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = _deploy(direct_deploy)
    direct_vm.sender = direct_alice
    contract.create_agreement(
        direct_bob,
        "ClientAgent",
        "ProviderAgent",
        "Audit Solidity contract",
        "Find vulnerabilities",
        "GitHub evidence",
        "24 hours",
        PAYMENT,
    )
    before = contract.get_agent(direct_bob)
    aid = contract.get_agreement_id_at(1)
    direct_vm.sender = direct_bob
    contract.accept_agreement(aid)
    contract.submit_evidence(
        aid,
        "https://example.com/audit-report",
        "",
        "",
        "",
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "Security audit completed successfully",
    )
    direct_vm.mock_web(
        r".*example\.com/audit-report.*",
        {"status": 200, "body": "completely different evidence body"},
    )
    direct_vm.mock_llm(
        r".*GenLayer validator judging.*",
        json.dumps(
            {
                "evidence_exists": True,
                "matches_requirements": True,
                "task_completed": True,
                "claim_supported": True,
            }
        ),
    )
    direct_vm.sender = direct_alice
    contract.request_verification(aid)
    item = contract.get_agreement(aid)
    assert item["result"] == "FAILED"
    assert item["status"] == "COMPLETED"
    after = contract.get_agent(direct_bob)
    assert after["failed_jobs"] == before["failed_jobs"] + 1
    assert after["successful_jobs"] == before["successful_jobs"]


def test_missing_evidence_is_inconclusive_and_finalize_refunds(
    direct_vm, direct_deploy, direct_alice, direct_bob
):
    contract = _deploy(direct_deploy)
    direct_vm.sender = direct_alice
    contract.create_agreement(
        direct_bob,
        "ClientAgent",
        "ProviderAgent",
        "Audit Solidity contract",
        "Find vulnerabilities",
        "GitHub evidence",
        "24 hours",
        PAYMENT,
    )
    aid = contract.get_agreement_id_at(1)
    direct_vm.sender = direct_bob
    contract.accept_agreement(aid)
    contract.submit_evidence(
        aid,
        "https://example.com/missing-report",
        "",
        "",
        "",
        "",
        "Security audit completed successfully",
    )
    direct_vm.mock_web(r".*missing-report.*", {"status": 404, "body": "not found"})
    direct_vm.sender = direct_alice
    contract.request_verification(aid)
    item = contract.get_agreement(aid)
    assert item["result"] == "INCONCLUSIVE"
    assert item["status"] == "DISPUTED"
    assert item["settled"] is False
    contract.finalize_agreement(aid)
    settled = contract.get_agreement(aid)
    assert settled["settled"] is True
    assert settled["status"] == "COMPLETED"


def test_register_agent_and_trust_score(direct_vm, direct_deploy, direct_alice):
    contract = _deploy(direct_deploy)
    direct_vm.sender = direct_alice
    contract.register_agent("NovaAudit-Agent", "Security", "Fuzzing,Formal Review", "0.07 ETH")
    agent = contract.get_agent(direct_alice)
    assert agent["name"] == "NovaAudit-Agent"
    assert agent["category"] == "Security"
    trust = contract.get_trust_score(direct_alice)
    assert trust["level"] == "D"
    assert trust["score"] == 0
    with direct_vm.expect_revert():
        contract.register_agent("Other", "Security", "Review", "0.01 ETH")


def test_anchor_proof_records_onchain_fingerprint(direct_vm, direct_deploy, direct_alice):
    contract = _deploy(direct_deploy)
    direct_vm.sender = direct_alice
    contract.anchor_proof("48291", "Security audit completed successfully")
    proof = contract.get_latest_proof("48291")
    assert proof["agreement_id"] == "48291"
    assert proof["claim"] == "Security audit completed successfully"
    assert proof["result"] == "SUCCESS"
    assert len(proof["fingerprint"]) == 64
    assert int(contract.get_proof_count()) == 1
    stats = contract.get_protocol_stats()
    assert stats["proof_count"] == 1
