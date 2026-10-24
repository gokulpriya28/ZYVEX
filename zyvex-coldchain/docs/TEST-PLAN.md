# Test plan

- Valid in-range reading is stored and creates no alert.
- Out-of-range reading is stored and creates a critical alert.
- Missing shipment ID, invalid temperature, malformed JSON return a 4xx response.
- Hash mismatch fails verification.
- HMAC mismatch fails verification.
- Wallet network mismatch blocks anchoring.
- Duplicate digest behavior matches contract policy.
- Audit export identifies simulated readings.
- Unauthenticated users cannot access tenant records before production launch.
