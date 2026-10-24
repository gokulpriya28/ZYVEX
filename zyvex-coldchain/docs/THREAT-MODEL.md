# Threat model

## Protect
Shipment metadata, temperature readings, signatures, alert history, and anchoring evidence.

## Current demo controls
SHA-256 digest, server HMAC tag, range checks, server-only service key, optional blockchain anchor.

## Risks that remain
Unauthenticated demo API routes; shared server HMAC key; simulated sensor values; in-memory fallback resets on restart; no sensor calibration proof; no alert email/SMS; no key rotation workflow. Do not use for regulated medicine handling until independently reviewed.

## Before production
Enable Supabase Auth and per-tenant authorization; enforce role and shipment ownership on every route; add device key registration, replay protection, rate limits, append-only audit policies, key rotation, alert delivery, monitoring, backups, and security testing.
