import iconv from 'iconv-lite';
import { http, HttpResponse } from 'msw';
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
            <div class="description">中文RSSHub1</div>
            <div class="date">2025-01-01</div>
        </li>
    </ul>
</div>`;

    it('parses charset from content-type', async () => {
        const { default: server } = await import('@/setup.test');
        server.use(
            http.get(
                'http://rsshub.test/buildData-gbk',
                () =>
                    new HttpResponse(iconv.encode(html, 'gbk'), {
                        headers: {
                            'content-type': 'text/html; charset=gbk',
                        },
                    })
            )
        );

        const data = await configUtils({
            link: 'http://rsshub.test/buildData-gbk',
            url: 'http://rsshub.test/buildData-gbk',
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
        expect(data.item[0].description).toBe('中文RSSHub1');
    });
});
