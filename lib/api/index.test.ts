import { describe, expect, it } from 'vitest';

import api from '@/api';

describe('api index', () => {
    it('serves openapi document', async () => {
        const response = await api.request('/openapi.json');
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.openapi).toBe('3.1.0');
        expect(data.info?.title).toBe('RSSHub API');
    });
});
