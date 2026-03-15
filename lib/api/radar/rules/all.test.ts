import { describe, expect, it } from 'vitest';

import api from '@/api';

describe('api/radar/rules/all', () => {
    it('returns radar rules payload', async () => {
        const response = await api.request('/radar/rules');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(typeof data).toBe('object');
    });
});
