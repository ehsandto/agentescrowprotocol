# AgentEscrow Protocol

Autonomous escrow and reputation for the agent economy, settled by GenLayer intelligent-contract consensus.

> AgentEscrow is the autonomous trust layer where AI agents can safely transact with each other.

## What it does

```
Agreement → Task execution → Evidence → GenLayer judgment → Settlement → Reputation
```

Validators independently fetch GitHub / IPFS evidence and decide `SUCCESS`, `FAILED`, or `INCONCLUSIVE`. The contract never trusts the claimant.

## Stack

- Next.js 14, TypeScript, Tailwind CSS
- GenLayer Studio Next intelligent contract (`contracts/AgentEscrowContract.py`)
- `genlayer-js` wallet + contract client
- SHA-256 evidence fingerprints (IPFS-compatible)

## Demo path

1. Open `/` — **Autonomous Agents Need Autonomous Trust**
2. Marketplace → **SecurityAudit-Agent**
3. Create Agreement (prefilled StartupAgent / 0.05 ETH audit)
4. Submit evidence (GitHub + report + IPFS)
5. Request GenLayer verification
6. Settlement + certificate `#48291`

Seeded on-chain demo agreement: **#48291**, result **SUCCESS**, consensus **12/12**.

## Run the app

```bash
cd agent-escrow-protocol
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without a contract address the UI runs a full local demo. Connect your **wallet** (`NEXT_PUBLIC_PRIVY_APP_ID`) and switch it to **Studio Next, chain ID `61997`**. The RPC is `https://studio-dev.genlayer.com/api`. Do not use StudioNet (`61999`) or `https://studio.genlayer.com/api`. Clicking **Request verification** anchors an on-chain proof in the intelligent contract.

## Contract

```bash
pip install -r requirements.txt
genvm-lint check contracts/AgentEscrowContract.py
pytest tests/direct/ -v
```

Deploy on Studio Next (chain `61997`). Use a GenLayer CLI that lists `studio-dev`. An older global CLI that only knows `studionet` will miss this network.

```bash
genlayer network set studio-dev
node scripts/deploy-studio-next.mjs
```

`scripts/deploy-studio-next.mjs` is the lab deployment path. It writes `deployment.studio-next.json`. Copy that `address` into `NEXT_PUBLIC_CONTRACT_ADDRESS`.

Current Studio Next deployment:

- Contract: [`0x99f8Ccf4f9b2d84E8C966d266459332351774f90`](https://explorer-studio-dev.genlayer.com/address/0x99f8Ccf4f9b2d84E8C966d266459332351774f90)
- Wallet: `0x7a413BB4AB62E31d62d4cD9efC8C8a8Dae37FB42`
- Harborline agreement `#48292`, status `CREATED`
- Transaction: [`0xd861029d299ffb85942128d0785c69e84b12646b0224afa6c7245db408c96004`](https://explorer-studio-dev.genlayer.com/tx/0xd861029d299ffb85942128d0785c69e84b12646b0224afa6c7245db408c96004)

Harborline Freight hired SecurityAudit-Agent for 0.05 ETH. The booking agent must not release that milestone until validators read the pinned Ownable source and agree that only the current owner can transfer ownership, and that the zero address is rejected.

The earlier StudioNet contract `0xae4e3AaA8E96bB5e147FfC51E81D955D60D5f312` (chain `61999`) is not this network.

## Boundary

| Layer | Owns |
| --- | --- |
| Frontend | Wallet UX, marketplace, evidence hashing, non-authoritative previews |
| GenLayer contract | Escrow state, evidence fingerprints, validator judgment, payout, reputation |
| External sources | GitHub / IPFS / reports — fetched independently by validators |

## Trust score

```
Successful Agreements / Total Agreements
```
