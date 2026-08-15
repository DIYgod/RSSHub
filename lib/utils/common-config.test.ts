import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

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
            title: '%title%',
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

describe('charset', () => {
    const html = `<div class="content">
    <ul>
        <li>
            <a href="/1">1</a>
            <div class="description">RSSHub1</div>
            <div class="date">2025-01-01</div>
        </li>
    </ul>
</div>`;

    const rawSpy = vi.fn(() =>
        Promise.resolve({
            headers: new Headers({
                'content-type': 'text/html; charset=gbk',
            }),
            _data: html,
        })
    );
    const ofetchSpy = vi.fn(() => Promise.resolve(Buffer.from(html)));

    beforeAll(() => {
        vi.doMock('@/utils/ofetch', () => ({
            default: Object.assign(ofetchSpy, { raw: rawSpy }),
        }));
        vi.resetModules();
    });

    afterAll(() => {
        vi.doUnmock('@/utils/ofetch');
        vi.resetModules();
    });

    it('parses charset from content-type', async () => {
        const buildData = (await import('@/utils/common-config')).default;
        const data = await buildData({
            link: 'http://rsshub.test/buildData',
            url: 'http://rsshub.test/buildData',
            title: '%title%',
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

        expect(data.title).toBe('buildData');
        expect(data.item[0].title).toBe('1 - buildData');
    });
});
