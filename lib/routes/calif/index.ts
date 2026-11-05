import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const handler = async (ctx) => {
    const baseUrl = 'https://calif.io';
    const researchUrl = `${baseUrl}/research`;
    const limit = getRouteLimit(ctx, 20);
    const { data } = await got(researchUrl);
    const $ = load(data);
    const articles = $('main section .grid a')
        .toArray()
        .filter((element) => $(element).find('h2').length > 0)
        .slice(0, limit)
        .map((element): DataItem => {
            const article = $(element);
            const link = new URL(article.attr('href')!, baseUrl).href;
            const date = article.find('p').first().text().trim();

            return {
                title: article.find('h2').text().trim(),
                description: article.find('h2').next('p').text().trim(),
                link,
                pubDate: date ? parseDate(date, 'MMMM D, YYYY') : undefined,
            };
        });

    const items = await pMap(
        articles,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const { data: articleData } = await got(item.link!);
                const detail = load(articleData);
                const article = detail('main article');
                const header = article.find('h1').parent();
                const metadata = header.find('h1').nextAll('div').first();
                const structuredData: { datePublished?: string; author?: { name?: string } } = JSON.parse(detail('script[type="application/ld+json"]:contains("TechArticle")').text() || '{}');
                const content = article.is(':has(> p):not(:has(h1))') ? article : article.find('#subscribe').prev('div');
                if (!content.text().trim()) {
                    throw new Error(`Unable to extract Calif article content from ${item.link}: the page layout may have changed.`);
                }
                const contentHtml = content.html()!;
                const author = structuredData.author?.name || metadata.find('p').first().text().trim();
                const date = metadata.find('p').eq(1).text().trim();

                return {
                    ...item,
                    title: article.find('h1').text().trim() || item.title,
                    description: contentHtml,
                    content: {
                        html: contentHtml,
                        text: content.text(),
                    },
                    author: author || undefined,
                    pubDate: structuredData.datePublished ? parseDate(structuredData.datePublished) : date ? parseDate(date, 'MMMM D, YYYY') : item.pubDate,
                    category: metadata
                        .find('a[href^="/research/"]')
                        .toArray()
                        .map((tag) => detail(tag).text().trim()),
                };
            }),
        { concurrency: 3 }
    );

    return {
        title: 'Calif Research',
        description: $('meta[name="description"]').attr('content'),
        link: researchUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/research',
    name: 'Research',
    url: 'calif.io',
    maintainers: ['shoeper'],
    handler,
    example: '/calif/research',
    description: 'Calif security research articles and write-ups.',
    categories: ['new-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['calif.io/research'],
            target: '/research',
        },
    ],
};
