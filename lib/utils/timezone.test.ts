import { describe, expect, it } from 'vitest';
import timezone from '@/utils/timezone';

describe('timezone', () => {
    it('timezone', () => {
        const serverTimezone = -new Date().getTimezoneOffset() / 60;
        expect(timezone(new Date('2024-01-01T01:01:01Z'), serverTimezone - 1).toISOString()).toEqual('2024-01-01T02:01:01.000Z');
    });
});
