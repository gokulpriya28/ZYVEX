# Architecture

- `app/`: Next.js App Router UI and HTTP endpoints.
- `lib/server-store.ts`: primary server-side persistence adapter. Uses Supabase when configured and in-memory demo mode otherwise.
- `src/domain/`: deterministic domain rules and types.
- `src/security/`: hashing, signature helpers, redaction, environment checks.
- `src/services/`: use-case helpers.
- `src/supabase/`: client and query helpers.
- `contracts/`: EVM contract for on-chain digest anchoring.
- `supabase/`: schema and optional migrations.

A blockchain anchor proves that a digest was submitted to a particular chain at a particular time. It does not prove that the source sensor was accurate. Browser ECDSA helpers are utility modules; production sensor identity needs device-managed private keys and server-side public-key registration.
