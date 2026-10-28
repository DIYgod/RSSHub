import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

export const handler = async (ctx) => {
    const { language = 'zh' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);

    const rootUrl = `https://${language === 'zh' ? 'www' : language.replaceAll(/[^\dA-Z-]/gi, '')}.zhonglun.com`;
    const currentUrl = new URL('research/articles', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div#dataList > dl > dd, div#dataList > ul > li')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const description = renderDescription({
                intro: $item.find('p').text(),
            });

            return {
                title: $item.find('h3 > a').text(),
                description,
                pubDate: parseDate($item.find('span').text()),
                link: $item.find('h3 > a').prop('href'),
                language,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(item.link!, async (): Promise<Pick<DataItem, 'title' | 'description' | 'pubDate' | 'author' | 'content' | 'image' | 'banner'>> => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('div.news_dtitle h2').text();
                const description = renderDescription({
                    description: $$('div.edit_con_original').html() ?? undefined,
                });
                const image = $$('img.raw-image').prop('src');

                return {
                    title,
                    description,
                    pubDate: parseDate($$('span.posttime').text()),
                    author: $$('span.author').text().split(/：/).pop(),
                    content: { text: $$('div.edit_con_original').text() },
                    image,
                    banner: image,
                };
            });
            const description = (item.description ?? '') + (detail.description ?? '');
            return { ...item, ...detail, description, content: { ...detail.content, html: description }, language };
        },
        { concurrency: 3 }
    );

    const image = new URL($('header.header h1 a img').prop('src')!, rootUrl).href;

    return {
        title: `${$('title').text()} - ${$('div.siteban_text').text()}`,
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        image,
        author: $('meta[name="author"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/research/article/:language?',
    name: '专业文章',
    url: 'zhonglun.com',
    maintainers: ['snipersteve', 'nczitzk'],
    handler,
    example: '/zhonglun/research/article/zh',
    parameters: { language: '语言，默认为 zh，即简体中文，可在对应分类页 URL 中找到' },
    description: `| ENG | 简体中文 | 日本語 | 한국어 |
| --- | -------- | ------ | ------ |
| en  | zh       | ja     | kr     |`,
    categories: ['new-media'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            title: '专业文章',
            source: ['zhonglun.com/research/articles'],
            target: '/research/article/zh',
        },
        {
            title: ' Articles',
            source: ['en.zhonglun.com/research/articles'],
            target: '/research/article/en',
        },
        {
            title: '論評',
            source: ['ja.zhonglun.com/research/articles'],
            target: '/research/article/ja',
        },
        {
            title: '전문기사',
            source: ['kr.zhonglun.com/research/articles'],
            target: '/research/article/kr',
        },
    ],
};
