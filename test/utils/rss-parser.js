import parser from '../../lib/utils/rss-parser';
import { value as config } from '../lib/config.js';
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
