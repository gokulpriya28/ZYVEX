# API reference

- `GET /api/health`: mode and health check.
- `GET /api/dashboard`: shipment, reading and alert snapshot.
- `POST /api/readings`: submit a temperature reading (existing route; inspect route for required fields).
- `POST /api/simulator`: create an explicitly simulated reading; body `{ "shipment_id": "...", "temperature": 9.2, "device_id": "SIM-SENSOR-01" }`.
- `POST /api/verify`: verify a reading using the current server integrity secret.
- `POST /api/demo-seed`: add an excursion demonstration reading.
- `POST /api/anchors`: save metadata after successful on-chain anchoring.

Demo routes are not authenticated. Do not expose publicly until authentication, authorization, rate limiting and schema validation are added.
