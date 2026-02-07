import { load } from 'cheerio';

import type { Route } from '@/types';
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
        .map((el) => {
            const $el = $(el);
            const $link = $el.find('h2.algolia-search--title a').first();
            const href = $link.attr('href');
            if (!href) {
                return null;
            }

            return {
                title: $link.text().trim(),
                link: href.startsWith('http') ? href : `${rootUrl}${href}`,
                pubDate: $el.find('time.datetime').attr('datetime') ? parseDate($el.find('time.datetime').attr('datetime')!) : undefined,
                author: $el.find('.author__container--name').text().trim() || undefined,
                image: $el.find('.field--name-field-teaser-image img').attr('src') || undefined,
            };
        })
        .filter(Boolean);

    const fullItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);

                const articleBody = content('.field--name-field-body-content').html() || '';
                const introText = content('.field--name-field-intro-text').text().trim();

                if (articleBody) {
                    item.description = (introText ? `<p><strong>${introText}</strong></p>` : '') + articleBody;
                } else if (introText) {
                    item.description = introText;
                }

                if (!item.pubDate) {
                    const detailTime = content('time').first().attr('datetime');
                    if (detailTime) {
                        item.pubDate = parseDate(detailTime);
                    }
                }

                if (!item.author) {
                    const detailAuthor = content('.node-meta__text a').first().text().trim();
                    if (detailAuthor) {
                        item.author = detailAuthor;
                    }
                }

                return item;
            })
        )
    );

    return {
        title: 'TCTMD - Conference News',
        description: 'Latest conference news coverage from TCTMD, the leading source for interventional cardiology news',
        link: `${rootUrl}/news/conference-news`,
        image: 'https://www.tctmd.com/themes/tctmd/logo.svg',
        item: fullItems,
    };
}
