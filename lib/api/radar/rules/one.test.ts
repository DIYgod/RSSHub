import { describe, expect, it } from 'vitest';

import api from '@/api';
import { getRadarRules } from '@/api/radar/rules/utils';

describe('api/radar/rules/one', () => {
    it('returns radar rules for a known domain', async () => {
        const rules = await getRadarRules();
        const domain = Object.keys(rules)[0];
        expect(domain).toBeDefined();

        const response = await api.request(`/radar/rules/${domain}`);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(rules[domain]);
    });

    it('returns an empty body for an unknown domain', async () => {
        const response = await api.request('/radar/rules/unknown.invalid');
        expect(response.status).toBe(200);
        const text = await response.text();
        expect(text).toBe('');
    });
});
