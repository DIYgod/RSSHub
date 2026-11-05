import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'cognition.com/blog',
    maintainers: ['Loongphy', 'ttttmr'],
    example: '/cognition/blog',
    categories: ['programming'],
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
            source: ['cognition.com/blog'],
        },
    ],
    view: ViewType.Articles,
    handler,
};

async function handler() {
    const baseUrl = 'https://cognition.com';
    const targetUrl = `${baseUrl}/blog`;
    const html = await ofetch(targetUrl);
    const $ = load(html);

    const posts = $('script[type="application/ld+json"]')
        .toArray()
        .map((script) => JSON.parse($(script).text()))
        .find((data) => data['@type'] === 'Blog')?.blogPost;
    const publishedDates = new Map<string, string>(posts?.map((post) => [post.url, post.datePublished]));

    const items = $('section li a')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const link = new URL($item.attr('href')!, baseUrl).href;
            const publishedDate = publishedDates.get(link);

            return {
                title: $item.find('h2').text(),
                link,
                description: $item.find('p').text(),
                pubDate: publishedDate ? parseDate(publishedDate) : parseDate($item.find('span').text(), 'MM.DD.YY'),
            };
        });

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
    };
}
