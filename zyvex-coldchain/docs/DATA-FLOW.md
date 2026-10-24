# Data flow

Simulator/device → input validation → timestamped reading → SHA-256 digest + server HMAC → Supabase insert → temperature range evaluation → alert record → batch canonicalization → wallet transaction to `ColdChainLedger` → audit export and independent digest comparison.
