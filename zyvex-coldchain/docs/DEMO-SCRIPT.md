# 3-minute hackathon demo

1. Explain the receiver's problem: transporter-provided logs can be changed after the journey.
2. Open the dashboard and identify the configured temperature range. State clearly that displayed readings are simulated.
3. Add a reading outside the configured range and show the critical excursion alert.
4. Verify a reading to show digest/HMAC validation.
5. Change a stored payload in a controlled test environment and show verification failure.
6. Anchor a batch digest to a test chain through MetaMask.
7. Explain the receiver recomputes the batch digest and compares it with the on-chain digest.
8. Export the audit report and explain limitations: chain anchoring makes the submitted digest tamper-evident, not the sensor truthful.
