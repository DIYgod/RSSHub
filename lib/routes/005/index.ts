import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const handler = async (ctx) => {
    const { category = 'zx' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const rootUrl = 'https://005.tv';
    const currentUrl = new URL(category ? `${category}/` : '', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('div.article-list ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('h3').text();
            const image = item.find('img').prop('src');

            const description = art(path.join(__dirname, 'templates/description.art'), {
                intro: item.find('div.p-row').text(),
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
            });

            return {
                title,
                description,
                pubDate: parseDate(item.find('span.time').text()),
                link: new URL(item.find('h3 a').prop('href'), rootUrl).href,
                content: {
                    html: description,
                    text: item.find('div.p-row').text(),
                },
                image,
                banner: image,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h1.articleTitle-name').text();
                const description = $$('div.articleContent').html();

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('.time').text()), +8);
                item.category = $$('meta[name="keywords"]').prop('content').split(/,/);
                item.content = {
                    html: description,
                    text: $$('div.articleContent').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL('templets/muban/style/images/logo.png', rootUrl).href;

    return {
        title,
        description: title.split(/_/)[0],
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: title.split(/,/).pop(),
        language,
    };
};

export const route: Route = {
    path: '/:category?',
    name: '资讯',
    url: '005.tv',
    maintainers: ['nczitzk'],
    handler,
    example: '/005/zx',
    parameters: { category: '分类，可在对应分类页 URL 中找到，默认为二次元资讯' },
    description: `
  | 二次元资讯 | 慢慢说 | 道听途说 | 展会资讯 |
  | ---------- | ------ | -------- | -------- |
  | zx         | zwh    | dtts     | zh       |
    `,
    categories: ['anime'],

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
            source: ['005.tv/:category'],
            target: (params) => {
                const category = params.category;

                return `/005${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '二次元资讯',
            source: ['005.tv/zx/'],
            target: '/005/zx',
        },
        {
            title: '慢慢说',
            source: ['005.tv/zwh/'],
            target: '/005/zwh',
        },
        {
            title: '道听途说',
            source: ['005.tv/dtts/'],
            target: '/005/dtts',
        },
        {
            title: '展会资讯',
            source: ['005.tv/zh/'],
            target: '/005/zh',
        },
    ],
};
