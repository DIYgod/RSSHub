import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/conference-news',
    categories: ['journal'],
    example: '/tctmd/conference-news',
    parameters: {},
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
            source: ['www.tctmd.com/news/conference-news'],
        },
    ],
    name: 'Conference News',
    maintainers: ['ChuYinan2023'],
    handler,
    url: 'www.tctmd.com/news/conference-news',
};

async function handler() {
    const rootUrl = 'https://www.tctmd.com';
    const currentUrl = `${rootUrl}/search?keyword=&f%5B0%5D=news_subtype%3AConference%20News&f%5B1%5D=type%3Anews`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('.views-row article.news-teaser')
        .toArray()
        .map((el): DataItem | null => {
            const $el = $(el);
            const $link = $el.find('h2.algolia-search--title a');
            const href = $link.attr('href');
            if (!href) {
                return null;
            }

            return {
                title: $link.text(),
                link: href.startsWith('http') ? href : `${rootUrl}${href}`,
                pubDate: $el.find('time.datetime').attr('datetime') ? parseDate($el.find('time.datetime').attr('datetime')!) : undefined,
                author: $el.find('.author__container--name').text().trim(),
                image: $el.find('.field--name-field-teaser-image img').attr('src'),
            };
        })
        .filter((item) => item !== null);

    const fullItems = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`tctmd:detail-fields:v1:${item.link}`, async (): Promise<Partial<DataItem>> => {
                const detailResponse = await got({ method: 'get', url: item.link });
                const content = load(detailResponse.data);
                const articleBody = content('.field--name-field-body-content').html() || '';
                const introText = content('.field--name-field-intro-text').text().trim();
                const date = content('time').first().attr('datetime');
                const author = content('.node-meta__text a').first().text().trim();
                return {
                    description: articleBody ? (introText ? `<p><strong>${introText}</strong></p>` : '') + articleBody : introText || undefined,
                    pubDate: date ? parseDate(date) : undefined,
                    author: author || undefined,
                };
            });
            return { ...detail, ...item, description: detail.description, pubDate: item.pubDate ?? detail.pubDate, author: item.author || detail.author };
        },
        { concurrency: 3 }
    );

    return {
        title: 'TCTMD - Conference News',
        description: 'Latest conference news coverage from TCTMD, the leading source for interventional cardiology news',
        link: `${rootUrl}/news/conference-news`,
        image: 'https://www.tctmd.com/themes/tctmd/logo.svg',
        item: fullItems,
    };
}
