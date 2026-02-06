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
            source: ['tctmd.com/news/conference-news'],
        },
    ],
    name: 'Conference News',
    maintainers: ['ChuYinan2023'],
    handler,
    url: 'tctmd.com/news/conference-news',
};

async function handler() {
    const rootUrl = 'https://www.tctmd.com';
    const currentUrl = `${rootUrl}/news/conference-news`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = [];

    // 1. Extract the featured article (article.hub-featured-teaser)
    const featured = $('article.hub-featured-teaser');
    if (featured.length) {
        const $link = featured.find('h2 a, h1 a, .hub-title a').first();
        const href = $link.attr('href');
        if (href) {
            items.push({
                title: $link.text().trim(),
                link: href.startsWith('http') ? href : `${rootUrl}${href}`,
                pubDate: featured.find('time').attr('datetime') ? parseDate(featured.find('time').attr('datetime')) : undefined,
                author: featured.find('.node-meta__text a').text().trim() || undefined,
            });
        }
    }

    // 2. Extract list articles (.view-content .item-list li)
    for (const el of $('.view-content .item-list li').toArray()) {
        const $el = $(el);
        const $link = $el.find('.hub-title a').first();
        const href = $link.attr('href');
        if (!href) {
            continue;
        }

        const title = $el.find('.hub-title a span').text().trim() || $link.text().trim();
        const datetime = $el.find('time').attr('datetime');
        const author = $el.find('.node-meta__text a').text().trim();
        const img = $el.find('.editor-pick-image img').first();
        const imgSrc = img.attr('src') || img.attr('data-src') || '';

        items.push({
            title,
            link: href.startsWith('http') ? href : `${rootUrl}${href}`,
            pubDate: datetime ? parseDate(datetime) : undefined,
            author: author || undefined,
            image: imgSrc || undefined,
        });
    }

    // 3. Fetch full article content with caching
    const fullItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });
                    const content = load(detailResponse.data);

                    // Extract article body
                    const articleBody = content('.field--name-field-body-content').html() || content('.field--name-body').html() || content('.node__content .field--name-field-body').html() || '';

                    // Extract intro text / summary
                    const subhead = content('.field--name-field-intro-text').text().trim() || content('.field--name-field-subhead').text().trim();

                    // Build description: subhead + body content
                    if (articleBody) {
                        item.description = (subhead ? `<p><strong>${subhead}</strong></p>` : '') + articleBody;
                    } else if (subhead) {
                        item.description = subhead;
                    }

                    // Extract more precise date from detail page if not already present
                    if (!item.pubDate) {
                        const detailTime = content('time').first().attr('datetime');
                        if (detailTime) {
                            item.pubDate = parseDate(detailTime);
                        }
                    }

                    // Extract author from detail page if not already present
                    if (!item.author) {
                        const detailAuthor = content('.node-meta__text a').first().text().trim();
                        if (detailAuthor) {
                            item.author = detailAuthor;
                        }
                    }
                } catch {
                    // If fetching detail fails, keep the item with list-page info only
                }

                return item;
            })
        )
    );

    return {
        title: 'TCTMD - Conference News',
        description: 'Latest conference news coverage from TCTMD, the leading source for interventional cardiology news',
        link: currentUrl,
        image: 'https://www.tctmd.com/themes/tctmd/logo.svg',
        item: fullItems,
    };
}
