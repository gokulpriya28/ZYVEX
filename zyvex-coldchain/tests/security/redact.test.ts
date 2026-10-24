import { describe, expect, it } from 'vitest';
import { redactSecrets } from '../../src/security/redact';
describe('secret redaction', () => { it('redacts secret-like keys', () => expect(redactSecrets({ HMAC_SECRET: 'private', status: 'ok' })).toEqual({ HMAC_SECRET: '[REDACTED]', status: 'ok' })); });
