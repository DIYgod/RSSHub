const configUtils = require('../../lib/utils/common-config');

describe('index', () => {
    it('transElemText', async () => {
        const $ = () => 'RSSHub';
        expect(configUtils.transElemText($, '$()')).toBe('RSSHub');
    });

    it('replaceParams', async () => {
        const $ = () => 'RSSHub';
        const data = {
            params: {
                title: 'RSSHub',
            },
            title: '%title%',
        };
        expect(configUtils.replaceParams(data, data.title, $)).toBe('RSSHub');
    });

    it('getProp', async () => {
        const $ = () => 'RSSHub';
        const data = {
            title: 'RSSHub',
        };
        expect(configUtils.getProp(data, ['title'], $)).toBe('RSSHub');
    });

    it('all', async () => {
        const $ = () => 'RSSHub';
        const data = {
            params: {
                title: '$()',
            },
            title: '%title%',
        };
        expect(configUtils.getProp(data, ['title'], $)).toBe('RSSHub');
    });
});
