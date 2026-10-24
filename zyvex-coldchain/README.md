# Zyvex ColdChain Ledger — Next.js + Supabase + EVM testnet

A hackathon MVP for the QUANTRIX 2K26 PS08 problem: tamper-evident cold-chain transport logs. It includes a responsive dashboard, shipment list, simulated temperature input, excursion alerts, server-side integrity checks, JSON audit export, Supabase persistence, and optional MetaMask / EVM contract anchoring.

> **Prototype limitation:** sensor values in the supplied workspace are simulated. HMAC/hash checks can detect changes relative to the server-held secret, but do not prove a physical sensor was accurate or that a person did not manipulate the sensor before ingestion. Do not use this prototype for real medicine safety decisions.

## 1. Run locally

Requirements: Node.js 20.9+ recommended, npm, and VS Code.

1. Extract the ZIP and open the `zyvex-coldchain` folder in VS Code. The folder should contain `package.json`.
2. Open **Terminal → New Terminal**.
3. Install dependencies:

   ```powershell
   npm install
   ```

4. Start the app:

   ```powershell
   npm run dev
   ```

5. Open http://localhost:3000.

Without environment variables, the dashboard runs in **local demo mode** with three sample shipments and simulated data. This demo store lives in the Next.js server process; restarting the dev server resets demo-created readings. Use Supabase to persist records.

## 2. Connect Supabase

1. Create a project at https://supabase.com.
2. Open **SQL Editor → New query**.
3. Copy all contents of `supabase/schema.sql`, run it, and confirm the `shipments`, `temperature_readings`, `temperature_alerts`, and `blockchain_anchors` tables exist.
4. In Supabase **Project Settings → API**, copy the Project URL and `service_role` secret.
5. In the project root, copy `.env.example` to `.env.local` and fill in:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_SECRET
   HMAC_SECRET=use-a-long-random-secret-at-least-32-characters
   NEXT_PUBLIC_CONTRACT_ADDRESS=
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

6. Restart `npm run dev` after changing environment variables.

**Security:** `SUPABASE_SERVICE_ROLE_KEY` and `HMAC_SECRET` are server-only secrets. Never prefix them with `NEXT_PUBLIC_`, paste them into browser code, or commit `.env.local` to Git. The supplied `.gitignore` excludes environment files. The API currently trusts callers for the demo and is not production-authenticated; add Supabase Auth, per-user authorization, rate limiting, and device credentials before public deployment.

The SQL turns on RLS and revokes direct access for `anon` and `authenticated`; the server API uses the service-role key. Do not create broad public policies for these tables.

## 3. Use the dashboard

- Select a shipment and submit a temperature. A SHA-256 digest and server HMAC tag are created on the server.
- When the reading is outside that shipment's `min_temp` / `max_temp`, the API creates a critical alert.
- Use **Verify** beside a reading to validate its digest and HMAC.
- **Run excursion demo** adds a 9.6°C sample to the first demo shipment (or matching shipment code in Supabase) so you can show an alert. It is explicitly simulated.
- **Export audit** downloads a JSON snapshot.
- Dashboard refreshes every 15 seconds.

## 4. Enable EVM blockchain anchoring (optional)

The included contract is `contracts/ColdChainLedger.sol`.

1. Open https://remix.ethereum.org.
2. Create `ColdChainLedger.sol` and paste the contract source.
3. Compile with Solidity `0.8.20` or compatible `0.8.x`.
4. Connect MetaMask to a test network you have test funds for (the example chain ID is Sepolia `11155111`). Never use real funds for a hackathon demo.
5. Deploy the contract in Remix and copy its deployed address.
6. Put the address in `.env.local` as `NEXT_PUBLIC_CONTRACT_ADDRESS=0x...` and set `NEXT_PUBLIC_CHAIN_ID` to the network's chain ID. Restart Next.js.
7. In the dashboard, click **Connect MetaMask**, select the same network, then click **Anchor current batch** and approve the transaction.
8. The app hashes a deterministic JSON representation of the current reading list and writes that `bytes32` digest on chain. When Supabase is configured, the transaction metadata is also stored in `blockchain_anchors`.

If a digest is already anchored, the contract rejects a duplicate. To anchor a changed batch, submit new readings so the batch digest changes. The contract has a `verify(bytes32)` read function that can be called from Remix or a contract explorer.

## 5. Project structure

```text
zyvex-coldchain/
├── app/
│   ├── api/
│   │   ├── anchors/route.ts       # Persist successful anchor metadata
│   │   ├── dashboard/route.ts     # Dashboard data endpoint
│   │   ├── demo-seed/route.ts     # Simulated excursion endpoint
│   │   ├── readings/route.ts      # Validate/store reading + alert
│   │   ├── verify/route.ts        # Verify digest/HMAC
│   ├── globals.css                # Responsive interface styling
│   ├── layout.tsx
│   └── page.tsx                   # Dashboard UI
├── contracts/ColdChainLedger.sol
├── lib/server-store.ts            # Supabase adapter + demo fallback + integrity logic
├── supabase/schema.sql            # Database schema, RLS, demo shipments
├── .env.example
└── README.md
```

## Troubleshooting

- `ECONNRESET` during install: check internet, try a mobile hotspot, then run `npm install` again.
- Port 3000 busy: use `npm run dev -- -p 3001`, then open http://localhost:3001.
- Dashboard says Supabase error: check URL/key, SQL schema, and server terminal; restart Next.js after `.env.local` changes.
- Wallet button says contract not configured: deploy the contract and set `NEXT_PUBLIC_CONTRACT_ADDRESS`.
- MetaMask transaction fails: confirm the selected wallet network matches the deployed contract network and has testnet gas tokens.
- Integrity verification fails after changing secrets: expected; signatures made with an old HMAC secret cannot be verified with a new one.

## Before production

Add real authentication and role-based authorization; device-level public-key signatures and key rotation; immutable append-only policies; strict input validation and rate limits; sensor calibration/attestation; server-side alert delivery (email/SMS); monitoring and backups; contract/network verification; privacy review; and operational testing. This is a hackathon MVP, not a certified cold-chain product.


## Expanded source layout

The project also includes a typed domain layer under `src/domain`, security utilities under `src/security`, use-case helpers under `src/services`, Supabase query helpers under `src/supabase`, reusable UI components, simulator and health endpoints, test examples, and security/deployment documentation. A Supabase Auth sign-in screen is available at `/sign-in`; create an account in Supabase Auth and configure `NEXT_PUBLIC_SUPABASE_ANON_KEY` to use it. The main dashboard is still accessible as a demo route; production route protection and tenant authorization must be wired and tested before deployment.

Run helper-module tests with `npm test` after dependencies install. Run `npm run typecheck` to check TypeScript. These tests cover helper logic, not the entire deployed application.
