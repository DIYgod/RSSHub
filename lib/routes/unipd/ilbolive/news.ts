import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ilbolive/news',
    name: 'Il Bo Live - News',
    url: 'ilbolive.unipd.it/it/news',
    maintainers: ['Gexi0619'],
    example: '/unipd/ilbolive/news',
    parameters: {},
    description: 'Il Bo Live - News',
    categories: ['university'],
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
            source: ['ilbolive.unipd.it/it/news'],
            target: '/ilbolive/news',
        },
    ],
    handler,
};

async function handler() {
    const baseUrl = 'https://ilbolive.unipd.it';
    const homeUrl = `${baseUrl}/it/news`;

    const response = await got(homeUrl);
    const $ = load(response.data);

    const items = $('#list-nodes .col.-s-6')
        .toArray()
        .map((el) => {
            const item = $(el);
            const title = item.find('.title a').text().trim();
            const href = item.find('.title a').attr('href');
            const link = baseUrl + href;
            const category = item.find('.category').text().trim();
            const image = item.find('.photo img').attr('src');
            const imageUrl = baseUrl + image;

            return {
                title,
                link,
                category,
                enclosure_url: imageUrl,
                enclosure_type: 'image/jpeg',
            };
        });

    const finalItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                const article = $('article.post-generic');

                // Picture
                article.find('img').each((_, el) => {
                    const img = $(el);
                    const src = img.attr('src');
                    if (src && src.startsWith('/')) {
                        img.attr('src', baseUrl + src);
                    }
                    img.attr('style', 'max-width: 100%; height: auto;');
                });

                const datetime = article.find('time.date').attr('datetime');
                const pubDate = datetime ? timezone(parseDate(datetime), 0) : undefined;

                const author = article.find('.author a').text().trim();

                // Delete header
                article.find('.header').remove();

                return {
                    ...item,
                    description: article.html() ?? '',
                    pubDate,
                    author,
                };
            })
        )
    );

    return {
        title: 'Il Bo Live - News',
        link: homeUrl,
        item: finalItems,
        language: 'it',
    };
}
