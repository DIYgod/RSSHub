import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:channel',
    categories: ['finance'],
    example: '/fx-markets/trading',
    parameters: { channel: 'channel, can be found in the navi bar links at the home page' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Channel',
    maintainers: ['mikkkee'],
    handler,
    description: `| Trading | Infrastructure | Tech and Data | Regulation |
| ------- | -------------- | ------------- | ---------- |
| trading | infrastructure | tech-and-data | regulation |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel');
    const link = `https://www.fx-markets.com/${channel}`;
    const html = (await got(link)).data;
    const $ = load(html);
    const pageTitle = $('header.select-header > h1').text();
    const title = `FX-Markets ${pageTitle}`;

    const items = $('div#listings').children();
    const articles = items.toArray().map((el): DataItem => {
        const $el = $(el);
        const $titleEl = $el.find('h5 > a');
        const articleURL = `https://www.fx-markets.com${$titleEl.attr('href')}`;
        const articleTitle = $titleEl.attr('title');
        return {
            title: articleTitle!,
            link: articleURL,
            pubDate: parseDate($el.find('time').text()),
        };
    });

    const result = await Promise.all(
        articles.map((item) =>
            cache.tryGet(item.link!, async () => {
                const res = await got(item.link);
                const doc = load(res.data);
                const dateScript = doc('script[type="application/ld+json"]').first().text();
                const metadata = JSON.parse(dateScript) as {
                    '@graph'?: Array<{ '@type'?: string; datePublished?: string; dateModified?: string }>;
                    datePublished?: string;
                    dateModified?: string;
                };
                const article = metadata['@graph']?.find((record) => record['@type'] === 'NewsArticle') ?? metadata;
                // Exclude hidden print message
                item.description = doc('div.article-page-body-content:not(.print-access-info)').html();
                return {
                    title: item.title!,
                    link: item.link,
                    description: item.description,
                    pubDate: article.datePublished ? parseDate(article.datePublished) : item.pubDate,
                    updated: article.dateModified ? parseDate(article.dateModified) : undefined,
                };
            })
        )
    );

    return {
        title,
        link,
        item: result,
    };
}
