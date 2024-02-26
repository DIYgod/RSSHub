import { describe, expect, it, afterAll } from '@jest/globals';
import supertest from 'supertest';
import server from '@/index';
import { load } from 'cheerio';

process.env.NODE_NAME = 'mock';

const request = supertest(server);
let gitHash;
try {
    gitHash = require('git-rev-sync').short();
} catch {
    gitHash = (process.env.HEROKU_SLUG_COMMIT && process.env.HEROKU_SLUG_COMMIT.slice(0, 7)) || 'unknown';
}

afterAll(() => {
    server.close();
});

describe('debug', () => {
    it('debug', async () => {
        const response1 = await request.get('/test/1');
        const etag = response1.headers.etag;
        await request.get('/test/1').set('If-None-Match', etag);
        await request.get('/test/2');
        await request.get('/test/empty');
        await request.get('/test/empty');

        const response = await request.get('/');

        const $ = load(response.text);
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
