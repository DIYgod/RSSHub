import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 22;

    const rootUrl = 'https://www.tradingview.com';
    const currentUrl = new URL(`blog/${category.endsWith('/') ? category : `${category}/`}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const list = $('article[id]')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const title = $item.find('div.title').text();

            return {
                title,
                link: $item.find('a.articles-grid-link').prop('href'),
                description: renderDescription({
                    image: {
                        src: $item
                            .find('div.articles-grid-img img')
                            .prop('src')!
                            .replace(/-\d+x\d+\./, '.'),
                        alt: title,
                    },
                }),
                category: $item
                    .find('a.section')
                    .toArray()
                    .map((c) => $(c).text()),
                guid: `tradingview-blog-${category}-${$item.prop('id')}`,
                pubDate: parseDate($item.find('div.date').text(), 'MMM D, YYYY'),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('div.entry-content')
                    .find('img')
                    .each((_, e) => {
                        content(e).replaceWith(
                            renderDescription({
                                image: {
                                    src: content(e)
                                        .prop('src')!
                                        .replace(/-\d+x\d+\./, '.'),
                                },
                            })
                        );
                    });

                item.title = content('meta[property="og:title"]').prop('content');
                item.description = renderDescription({
                    image: {
                        src: content('meta[property="og:image"]').prop('content'),
                        alt: item.title,
                    },
                    description: content('div.entry-content').html() ?? undefined,
                });
                item.author = content('meta[property="og:site_name"]').prop('content');
                item.category = content('div.sections a.section')
                    .toArray()
                    .map((c) => content(c).text());
                item.pubDate = parseDate(content('div.single-date').text(), 'MMM D, YYYY');

                return item;
            }),
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
