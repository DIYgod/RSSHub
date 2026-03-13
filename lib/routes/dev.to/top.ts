import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/top/:period',
    categories: ['programming'],
    example: '/dev.to/top/week',
    parameters: { period: 'Period (week, month, year, infinity)' },
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
            source: ['dev.to/top/:period'],
        },
    ],
    name: 'Top Posts',
    maintainers: ['dwemerx', 'Rjnishant530'],
    handler,
    url: 'dev.to/top',
};

async function handler(ctx) {
    const period = ctx.req.param('period');
    const baseUrl = 'https://dev.to';
    const link = `${baseUrl}/top/${period}`;

    // Calculate date based on period
    const date = new Date();

    switch (period) {
        case 'week':
            date.setDate(date.getDate() - 7);
            break;
        case 'month':
            date.setMonth(date.getMonth() - 1);
            break;
        case 'year':
            date.setFullYear(date.getFullYear() - 1);
            break;
        case 'infinity':
        default:
            date.setFullYear(date.getFullYear() - 5);
            break;
    }

    const publishedDate = date.toISOString();
    const apiUrl = `https://dev.to/search/feed_content?per_page=15&sort_by=public_reactions_count&sort_direction=desc&approved=&class_name=Article&published_at%5Bgte%5D=${encodeURIComponent(publishedDate)}`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const data = response.data;

    // Fetch content for each article
    const items = await Promise.all(
        data.result.map((item) => {
            const articleUrl = `${baseUrl}${item.path}`;
            return cache.tryGet(articleUrl, async () => {
                const articleResponse = await got(articleUrl);
                const $ = load(articleResponse.data);

                // Extract article cover image
                const coverImage = $('.crayons-article__cover img').attr('src');

                // Extract article content
                const content = $('.crayons-article__body').html() || '';

                return {
                    title: item.title,
                    author: [
                        {
                            name: item.user.name,
                            url: `${baseUrl}/${item.user.username}`,
                            avatar: item.user.profile_image_90,
                        },
                    ],
                    link: articleUrl,
                    pubDate: parseDate(item.published_at_int * 1000),
                    description: content,
                    category: item.tag_list,
                    image: coverImage,
                } as DataItem;
            });
        })
    );

    return {
        title: `dev.to top (${period})`,
        link,
        description: 'Top dev.to posts',
        language: 'en-us',
        item: items,
        icon: 'https://media2.dev.to/dynamic/image/width=32,height=,fit=scale-down,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F8j7kvp660rqzt99zui8e.png',
    } as Data;
}
