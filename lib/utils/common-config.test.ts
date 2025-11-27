import { describe, expect, it } from 'vitest';

import configUtils, { getProp, replaceParams, transElemText } from '@/utils/common-config';

describe('index', () => {
    it('transElemText', () => {
        const $ = () => 'RSSHub';
        expect(transElemText($, '$()')).toBe('RSSHub');
    });

    it('replaceParams', () => {
        const $ = () => 'RSSHub';
        const data = {
            params: {
                title: 'RSSHub',
            },
            title: '%title%',
        };
        expect(replaceParams(data, data.title, $)).toBe('RSSHub');
    });

    it('getProp', () => {
        const $ = () => 'RSSHub';
        const data = {
            title: 'RSSHub',
        };
        expect(getProp(data, ['title'], $)).toBe('RSSHub');
        expect(getProp(data, 'title', $)).toBe('RSSHub');
    });

    it('all', () => {
        const $ = () => 'RSSHub';
        const data = {
            params: {
                title: '$()',
            },
            title: '%title%',
        };
        expect(getProp(data, ['title'], $)).toBe('RSSHub');
    });

    it('buildData', async () => {
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
                pubDate: `timezone(parseDate($('.date').text(), 'YYYY-MM-DD'), 0)`,
            },
        });

        expect(data).toMatchObject({
            link: 'http://rsshub.test/buildData',
            title: 'buildData',
            item: [
                {
                    description: 'RSSHub1',
                    guid: undefined,
                    link: '/1',
                    pubDate: new Date('2025-01-01T00:00:00Z'),
                    title: '1 - buildData',
                },
                {
                    description: 'RSSHub2',
                    guid: undefined,
                    link: '/2',
                    pubDate: new Date('2025-01-02T00:00:00Z'),
                    title: '2 - buildData',
                },
            ],
        });
    });
});
