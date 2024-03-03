import { describe, expect, it } from 'vitest';
import parser from '@/utils/rss-parser';
import { config } from '@/config';
import nock from 'nock';

describe('got', () => {
    it('headers', async () => {
        nock('http://rsshub.test')
            .get('/test')
            .reply(function () {
                expect(this.req.headers['user-agent']).toBe(config.ua);
                return [200, '<rss version="2.0"><channel><item></item></channel></rss>'];
            });

        await parser.parseURL('http://rsshub.test/test');
    });
});
