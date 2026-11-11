import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const rootUrl = 'https://mistral.ai';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/mistral/news',
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
            source: ['mistral.ai/news', 'mistral.ai/news/rss'],
            target: '/news',
        },
    ],
    name: 'News',
    maintainers: ['ljh12138164'],
    handler,
    url: 'mistral.ai/news',
};

async function handler(ctx) {
    const limit = getRouteLimit(ctx, 20);
    const response = await ofetch(`${rootUrl}/news/rss`, { parseResponse: (txt) => txt });
    const $ = load(response, { xmlMode: true });

    const list: DataItem[] = $('item')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const $el = $(el);
            return {
                title: $el.find('title').text(),
                link: $el.find('link').text(),
                description: $el.find('description').text(),
                pubDate: parseDate($el.find('pubDate').text()),
            };
        });

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detail = await ofetch(item.link!);
                const $ = load(detail);
                const article = $('article#blogpost');

                const category = article.find('h1').first().siblings('p').first().text().trim();

                // The byline is a paragraph like "By Mistral" in the hero section
                const byline = article
                    .find('p')
                    .toArray()
                    .map((el) => $(el).text().trim())
                    .find((text) => text.startsWith('By '));
                const author = byline?.slice('By '.length).trim();

                // The post body container inside <article id="blogpost">
                let content = article.children('div[class*="border-border-primary"]');
                if (!content.length) {
                    content = article
                        .children('div')
                        .filter((_, el) => $(el).find('p').length > 0)
                        .first();
                }
                if (!content.length) {
                    content = article.children('div').first();
                }
                content.find('svg, script, style, mistral-atom-text-vibe').remove();
                content.find('img').each((_, e) => {
                    const $e = $(e);
                    $e.removeAttr('srcset sizes loading decoding width height class');
                    const src = $e.attr('src');
                    if (src?.startsWith('/')) {
                        $e.attr('src', `${rootUrl}${src}`);
                    }
                });
                content.find('a[href^="/"]').each((_, e) => {
                    const $e = $(e);
                    $e.attr('href', `${rootUrl}${$e.attr('href')}`);
                });

                const html = content.html();
                return {
                    ...item,
                    description: html || item.description,
                    category: category ? [category] : undefined,
                    author: author || undefined,
                } as DataItem;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Mistral AI News',
        link: `${rootUrl}/news`,
        description: 'Latest news and updates from Mistral',
        item: items,
    };
}
