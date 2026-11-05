import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog/:language?',
    categories: ['programming'],
    example: '/nodejs/blog',
    parameters: { language: 'Language, see below, en by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['nodejs.org/:language/blog', 'nodejs.org/'],
        },
    ],
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    description: `Official RSS Source: <https://nodejs.org/en/feed/blog.xml>

| العربية | Catalan | Deutsch | Español | زبان فارسی |
| ------- | ------- | ------- | ------- | ---------- |
| ar      | ca      | de      | es      | fa         |

| Français | Galego | Italiano | 日本語 | 한국어 |
| -------- | ------ | -------- | ------ | ------ |
| fr       | gl     | it       | ja     | ko     |

| Português do Brasil | limba română | Русский | Türkçe | Українська |
| ------------------- | ------------ | ------- | ------ | ---------- |
| pt-br               | ro           | ru      | tr     | uk         |

| 简体中文 | 繁體中文 |
| -------- | -------- |
| zh-cn    | zh-tw    |`,
};

async function handler(ctx) {
    const language = ctx.req.param('language') ?? 'en';

    const rootUrl = 'https://nodejs.org';
    const currentUrl = `${rootUrl}/${language}/blog`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('article')
        .toArray()
        .map((article): DataItem => {
            const $article = load(article);

            const author = $article('footer p').text();
            const date = $article('footer time').attr('datetime');
            const pubDate = date ? parseDate(date) : undefined;

            const title = $article('a[aria-label]').prop('aria-label');
            const href = $article('a[aria-label]').attr('href');

            return {
                title: title!,
                link: `${rootUrl}${href}`,
                author,
                pubDate,
            };
        });

    items = await pMap(
        items,
        async (item) => ({
            ...item,
            description: await cache.tryGet(`nodejs:article-body:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const $content = load(detailResponse.data);

                const $main = $content('main');
                $main.children('h1, section').remove();
                $main
                    .children('div')
                    .filter((_, element) => $content(element).children('[aria-hidden="true"], a[class*="crossLink"]').length > 0)
                    .remove();
                return $main.html();
            }),
        }),
        { concurrency: 3 }
    );

    return {
        title: 'News - Node.js',
        link: currentUrl,
        item: items,
    };
}
