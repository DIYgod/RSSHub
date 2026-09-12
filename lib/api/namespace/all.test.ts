import { describe, expect, it } from 'vitest';

import api from '@/api';
import { namespaces } from '@/registry';

describe('api/namespace/all', () => {
    it('returns all namespaces', async () => {
        const response = await api.request('/namespace');
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(namespaces);
    });
});
