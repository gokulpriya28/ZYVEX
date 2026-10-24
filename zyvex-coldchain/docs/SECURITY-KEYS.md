# Key handling

- `SUPABASE_SERVICE_ROLE_KEY`: server only; full database privileges.
- `HMAC_SECRET`: server only; use a cryptographically random secret with 32+ characters.
- ECDSA device keys: private keys stay on the device; register public keys and key IDs.
- Wallet key: held in MetaMask; this app should never ask users to paste a wallet private key.
- Rotate secrets through a planned migration; changing HMAC_SECRET invalidates prior HMAC verification unless versioned key IDs are implemented.
