import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/blog/:category{.+}?',
    categories: ['program-update'],
    example: '/tradingview/blog/en',
    parameters: {
        category: 'Language, see below, `en` as English by default',
    },
    name: 'Blog',
    maintainers: ['nczitzk'],
    handler,
    description: `#### Language

| Id | Language            |
| -- | ------------------- |
| en | English             |
| ru | Русский             |
| ja | 日本語              |
| es | Español             |
| tr | Türkçe              |
| ko | 한국어              |
| it | Italiano            |
| pt | Português do Brasil |
| de | Deutsch             |
| fr | Français            |
| pl | Polski              |
| id | Bahasa Indonesia    |
| my | Bahasa Malaysia     |
| tw | 繁體                |
| cn | 简体                |
| vi | Tiếng Việt          |
| th | ภาษาไทย             |
| sv | Svenska             |
| ar | العربية             |
| il | Hebrew              |

#### Category

| Category                                                                                       | ID                            |
| ---------------------------------------------------------------------------------------------- | ----------------------------- |
| [Alerts](https://www.tradingview.com/blog/en/category/alerts/)                                 | category/alerts               |
| [Bitcoin and Crypto](https://www.tradingview.com/blog/en/category/bitcoin-charts/)             | category/bitcoin-charts       |
| [Business Updates](https://www.tradingview.com/blog/en/category/business-updates/)             | category/business-updates     |
| [Charting](https://www.tradingview.com/blog/en/category/charts/)                               | category/charts               |
| [Charting Library](https://www.tradingview.com/blog/en/category/charting-library/)             | category/charting-library     |
| [Data Feeds and Exchanges](https://www.tradingview.com/blog/en/category/data-feeds-exchanges/) | category/data-feeds-exchanges |
| [Desktop](https://www.tradingview.com/blog/en/category/desktop/)                               | category/desktop              |
| [Market Analysis](https://www.tradingview.com/blog/en/category/market-analysis/)               | category/market-analysis      |
| [Mobile](https://www.tradingview.com/blog/en/category/mobile/)                                 | category/mobile               |
| [Pine Script®](https://www.tradingview.com/blog/en/category/pine/)                             | category/pine                 |
| [Screener](https://www.tradingview.com/blog/en/category/stock-screener/)                       | category/stock-screener       |
| [Social](https://www.tradingview.com/blog/en/category/social/)                                 | category/social               |
| [Trading and Brokerage](https://www.tradingview.com/blog/en/category/trading/)                 | category/trading              |
| [Widgets](https://www.tradingview.com/blog/en/category/widgets/)                               | category/widgets              |`,
};

async function handler(ctx) {
    const { category = 'en' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 22);

    const rootUrl = 'https://www.tradingview.com';
    const currentUrl = new URL(`blog/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const list = $('article[id]')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const title = $item.find('.title').text();

            return {
                title,
                link: new URL($item.find('a.articles-grid-link').prop('href')!, rootUrl).href,
                description: renderDescription({
                    image: {
                        src: $item.find('div.articles-grid-img img').prop('src'),
                        alt: title,
                    },
                }),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`tradingview:blog:detail:v5:${item.link}`, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                const title = content('h1.single-title').text();
                const description = renderDescription({
                    image: {
                        src: content('meta[property="og:image"]').prop('content'),
                        alt: title,
                    },
                    description: content('div.entry-content').html() ?? undefined,
                });
                return {
                    title,
                    description,
                    author: content('meta[name="author"]').prop('content'),
                    category: JSON.parse(content('script[type="application/ld+json"]').text())['@graph'].find((node) => node['@type'] === 'BlogPosting').articleSection,
                    pubDate: parseDate(content('meta[property="article:published_time"]').prop('content')),
                    updated: parseDate(content('meta[property="article:modified_time"]').prop('content')),
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    const icon = new URL($('link[rel="icon"]').prop('href')!, rootUrl).href;

    const language = $('html').prop('lang') as Language;

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        description: $('div.site-subtitle').text(),
        language,
        icon,
        logo: icon,
        subtitle: $('h1.site-title').text(),
    };
}
