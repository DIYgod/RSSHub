import { describe, expect, it } from '@jest/globals';

import app from '@/app';

describe('index', () => {
    it('serve index', async () => {
        const res = await app.request('/');
        expect(res.status).toBe(200);
        expect(await res.text()).toContain('Welcome to RSSHub!');
    });
});
