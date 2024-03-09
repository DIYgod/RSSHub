import { describe, expect, it } from 'vitest';
import configUtils, { transElemText, replaceParams, getProp } from '@/utils/common-config';
import nock from 'nock';

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
        nock('http://rsshub.test')
            .get('/buildData')
            .reply(() => [
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
            ]);
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

        expect(data).toMatchObject({
            link: 'http://rsshub.test/buildData',
            title: 'buildData',
            item: [
                {
                    description: 'RSSHub1',
                    guid: undefined,
                    link: '/1',
                    pubDate: undefined,
                    title: '1 - buildData',
                },
                {
                    description: 'RSSHub2',
                    guid: undefined,
                    link: '/2',
                    pubDate: undefined,
                    title: '2 - buildData',
                },
            ],
        });
    });
});
