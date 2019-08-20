const configUtils = require('../../lib/utils/common-config');
const nock = require('nock');

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
        expect(configUtils.getProp(data, 'title', $)).toBe('RSSHub');
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

    it('buildData', async () => {
        nock('http://rsshub.test')
            .get('/buildData')
            .reply(function() {
                return [
                    200,
                    `<div class="content">
                <ul>
                    <li>
                        <a href="/1">1</a>
                        <div class="description">RSSHub1</div>
                    </li>
                    <li>
                        <a href="/2">2</a>
                        <div class="description">RSSHub2</div>
                    </li>
                </ul>
            </div>`,
                ];
            });
        const data = await configUtils({
            link: 'http://rsshub.test/buildData',
            url: 'http://rsshub.test/buildData',
            title: `%title%`,
            params: {
                title: 'buildData',
            },
            item: {
                item: '.content li',
                title: `$('a').text() + ' - %title%'`,
                link: `$('a').attr('href')`,
                description: `$('.description').html()`,
            },
        });

        expect(data.item.length).toBe(2);
        expect(data.item[1].title).toBe('2 - buildData');
        expect(data.item[1].description).toBe('RSSHub2');
    });
});
