const parser = require('../../lib/utils/rss-parser');
const config = require('../../lib/config').value;
const nock = require('nock');

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
