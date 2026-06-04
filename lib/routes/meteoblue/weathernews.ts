import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/weathernews',
    name: 'Weather News',
    maintainers: ['tssujt'],
    handler,
    example: '/meteoblue/weathernews',
    categories: ['blog'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    description: 'Weather news and articles from meteoblue',
};

async function handler() {
    const baseUrl = 'https://www.meteoblue.com';
    const url = `${baseUrl}/en/blog/article/weathernews`;

    const response = await ofetch(url);
    const $ = load(response);

    // Extract articles from the page using the actual HTML structure
    const articles = $('article[itemprop="blogPost"]')
        .toArray()
        .map((element) => {
            const $article = $(element);

            // Get title and link from h3 > a
            const $link = $article.find('h3[itemprop="headline"] a[itemprop="mainEntityOfPage"]');
            const title = $link.text().trim();
            const link = $link.attr('href');

            if (!title || !link) {
                return null;
            }

            // Get date from time element
            const $time = $article.find('time[itemprop="datePublished"]');
            const dateText = $time.attr('datetime') || '';

            // Extract author from the time element text
            const $authorMeta = $article.find('meta[itemprop="author"]');
            const author = $authorMeta.attr('content')?.trim() || 'meteoblue';

            // Get description from itemprop="description"
            const $description = $article.find('div[itemprop="description"]');
            const description = $description.text().trim() || title;

            return {
                title,
                link: link.startsWith('http') ? link : `${baseUrl}${link}`,
                pubDate: dateText ? parseDate(dateText) : undefined,
                author,
                description,
            };
        })
        .filter(Boolean);

    return {
        title: 'meteoblue Weather News',
        link: url,
        description: 'Latest weather news and articles from meteoblue',
        item: articles,
        allowEmpty: true,
    };
}
