import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/hkej/index',
    parameters: { category: '分類，預設為全部新聞' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.hkej.com/instantnews/:category', 'www.hkej.com/instantnews'],
        },
    ],
    name: '即時新聞',
    maintainers: ['TonyRL'],
    handler,
    url: 'hkej.com/',
    description: `| index    | stock    | hongkong | property | china    | international | current  | market   | announcement | hkex       |
| -------- | -------- | -------- | -------- | -------- | ------------- | -------- | -------- | ------------ | ---------- |
| 全部新闻 | 港股直擊 | 香港財經 | 地產新聞 | 中國財經 | 國際財經      | 時事脈搏 | 即巿股評 | 重要通告     | 港交所通告 |`,
};

function getArticleLink(href: string | undefined, baseUrl: string) {
    if (!href) {
        throw new Error('The Hong Kong Economic Journal listing is missing an article link.');
    }
    const url = new URL(href, baseUrl);
    const articlePath = url.pathname.match(/^(.+\/article\/\d+)(?:\/.*)?$/)?.[1];
    if (!articlePath) {
        throw new Error(`The Hong Kong Economic Journal listing has an invalid article link: ${url.href}`);
    }
    url.pathname = articlePath;
    return url.href;
}

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'index';
    const baseUrl = 'https://www.hkej.com';

    const link = `${baseUrl}/instantnews${category === 'index' ? '' : `/${category}`}`;
    const response = await ofetch.raw(link);
    const cookies = response.headers
        .getSetCookie()
        .map((item) => item.split(';', 1)[0])
        .join(';');
    const $ = load(response._data);

    const list = $('h3 a, h4 a')
        .toArray()
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: getArticleLink($item.attr('href'), baseUrl),
            };
        });

    const renderDesc = (pics, desc) =>
        renderToString(
            <>
                {pics.map((pic) => (
                    <figure>
                        <img src={pic.href} alt={pic.title} />
                        <figcaption>{pic.title}</figcaption>
                    </figure>
                ))}
                {raw(desc ?? '')}
            </>
        );

    const items = await pMap<DataItem & { link: string }, DataItem>(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`hkej:article-details:${item.link}`, async () => {
                const article = await ofetch(item.link, { headers: { cookie: cookies } });
                const content = load(article);

                // fix article image
                const articleImg = (content('div.hkej_detail_thumb_2014 td a').length ? content('div.hkej_detail_thumb_2014 td a') : content('div.thumb td a')).toArray().map((e) => {
                    const $e = content(e);
                    return {
                        href: $e.attr('href'),
                        title: $e.attr('title'),
                    };
                });

                const ldJson = content('script[type="application/ld+json"]:contains("NewsArticle")').text();
                const pubDate = ldJson.match(/"datePublished": ?"?([^",]+)/)?.[1];

                const category = [
                    ...new Set(
                        content('p.info span.cate a, #related-articles-wrapper a font')
                            .toArray()
                            .map((e) => content(e).text())
                            .filter(Boolean)
                    ),
                ];
                return {
                    category,
                    description: renderDesc(articleImg, content('div#article-content').html()),
                    pubDate: pubDate ? parseDate(pubDate) : undefined,
                };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
        language: 'zh-HK' as const,
    };
}
