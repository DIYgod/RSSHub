const parser = require('../../lib/utils/rss-parser');

describe('parser', () => {
    it('parseURL', async () => {
        const rss = await parser.parseURL('https://rsshub.app/rsshub/rss');
        expect(rss.link).toBe('https://docs.rsshub.app');
    });
});
