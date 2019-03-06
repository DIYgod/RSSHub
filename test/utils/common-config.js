const buildData = require('../../lib/utils/common-config');

describe('common-config', () => {
    it('config-content', async () => {
        const link = 'http://0.0.0.0:1200';
        const data = await buildData({
            link,
            url: link,
            title: `$('.content>h1>span').text()`,
            item: {
                item: 'details>div',
                title: `$('.debug-key').text()`,
                description: `$('.debug-value').text()`,
            },
        });
        expect(data.title).toBe('RSSHub');
        expect(data.item.length).toBe(9);
    });
});
