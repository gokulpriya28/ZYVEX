# Sensor integration contract

A future device should POST JSON containing `shipment_id`, `temperature`, `device_id`, `recorded_at`, `nonce`, `key_id`, and a device-generated digital signature. The server must validate the device's registered public key, timestamp freshness, nonce uniqueness, shipment assignment, and temperature bounds before persistence. Never trust a `simulated: false` client flag by itself. The current project does not connect to physical hardware.
