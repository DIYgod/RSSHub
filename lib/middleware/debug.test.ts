import { describe, expect, it } from '@jest/globals';
import app from '@/app';
import { load } from 'cheerio';

process.env.NODE_NAME = 'mock';

let gitHash;
try {
    gitHash = require('git-rev-sync').short();
} catch {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || 'unknown';
}

describe('debug', () => {
    it('debug', async () => {
        const response1 = await app.request('/test/1');
        const etag = response1.headers.get('etag');
        await app.request('/test/1', {
            headers: {
                'If-None-Match': etag!,
            },
        });
        await app.request('/test/2');
        await app.request('/test/empty');
        await app.request('/test/empty');

        const response = await app.request('/');

        const $ = load(await response.text());
        $('.debug-item').each((index, item) => {
            const key = $(item).find('.debug-key').html()?.trim();
            const value = $(item).find('.debug-value').html()?.trim();
            switch (key) {
                case 'Node Name:':
                    expect(value).toBe('mock');
                    break;
                case 'Git Hash:':
                    expect(value).toBe(gitHash);
                    break;
                case 'Request Amount:':
                    expect(value).toBe('6');
                    break;
                case 'ETag Matched:':
                    expect(value).toBe('1');
                    break;
                default:
            }
        });
    });
});
