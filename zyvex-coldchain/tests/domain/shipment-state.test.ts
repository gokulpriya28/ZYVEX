import { describe, expect, it } from 'vitest';
import { canTransition } from '../../src/domain/shipment-state';
describe('shipment transitions',()=>{it('allows transit after creation',()=>expect(canTransition('created','in_transit')).toBe(true));it('does not reopen a delivered shipment',()=>expect(canTransition('delivered','in_transit')).toBe(false));});
