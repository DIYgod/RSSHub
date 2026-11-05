import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:user',
    categories: ['social-media'],
    example: '/rattibha/user/elonmusk',
    parameters: { user: 'Twitter username, without @' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [{ source: ['rattibha.com/:user'] }],
    name: 'User Threads',
    maintainers: ['yshalsager'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://rattibha.com';
    const user = ctx.req.param('user');
    const response: { html: string } = await ofetch(`${baseUrl}/api/author-threads?page=1&username=${encodeURIComponent(user)}&sort=recent`);
    const $ = load(response.html);
    const list: Array<DataItem & { link: string; title: string }> = $('a[href^="/thread/"]')
        .toArray()
        .map((element) => ({
            title: $(element).find('.tc-text').text(),
            author: $(element).find('.tc-name').text(),
            link: new URL($(element).attr('href') ?? '', baseUrl).href,
        }))
        .filter((item, index, items) => items.findIndex((other) => other.link === item.link) === index);
    const items = await pMap(
        list,
        async (item) => {
            const article = await cache.tryGet(`rattibha:thread:v2:${item.link}`, async () => {
                const pageSource1 = await ofetch(item.link);
                const detail = load(pageSource1);
                const lang = detail('html').attr('lang');
                const language: Language | undefined = ['en', 'fr', 'es'].includes(lang ?? '') ? (lang as 'en' | 'fr' | 'es') : undefined;
                if (!detail('.tweet-content').length) {
                    throw new Error(`Rattibha did not return a thread body for ${item.link}`);
                }
                return {
                    listingTitle: item.title,
                    title: detail('.tweet-text').first().text() || item.title,
                    description: detail('.tweet-content')
                        .toArray()
                        .map((element) => detail(element).prop('outerHTML'))
                        .join(''),
                    date: detail('meta[property="article:published_time"]').attr('content'),
                    modified: detail('meta[property="article:modified_time"]').attr('content'),
                    language,
                    image: detail('meta[property="og:image"]').attr('content'),
                };
            });
            return {
                ...item,
                title: item.title === article.listingTitle ? article.title : item.title,
                description: article.description,
                pubDate: article.date ? parseDate(article.date) : undefined,
                updated: article.modified ? parseDate(article.modified) : undefined,
                image: article.image,
                language: article.language,
            };
        },
        { concurrency: 3, stopOnError: false }
    );
    const language = items[0]?.language;
    return {
        title: `سلاسل تغريدات ${user}`,
        link: `${baseUrl}/${encodeURIComponent(user)}`,
        item: items,
        language: items.every((item) => item.language === language) ? language : undefined,
    };
}
