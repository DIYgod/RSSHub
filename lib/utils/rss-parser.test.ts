import { describe, expect, it } from 'vitest';

import parser from '@/utils/rss-parser';

describe('rss-parser', () => {
    it('rss', async () => {
        const result = await parser.parseURL('http://rsshub.test/rss');
        expect(result).toBeTruthy();
    });
});
