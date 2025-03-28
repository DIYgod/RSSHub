import { Route } from '@/types';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ilbolive/news',
    name: 'Il Bo Live - News',
    url: 'https://ilbolive.unipd.it/it/news',
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
            target: '/unipd/ilbolive/news',
        },
    ],
    handler,
};

async function handler() {
    const baseUrl = 'https://ilbolive.unipd.it';
    const homeUrl = `${baseUrl}/it/news`;

    const response = await got(homeUrl);
    const $ = load(response.data);

    const items = $('#list-nodes .col')
        .toArray()
        .map((el) => {
            const item = $(el);
            const title = item.find('.title a').text().trim();
            const href = item.find('.title a').attr('href');
            const link = href ? baseUrl + href : null;
            const category = item.find('.category').text().trim();
            const image = item.find('.photo img').attr('src');
            const imageUrl = image ? baseUrl + image : null;

            return title && link
                ? {
                      title,
                      link,
                      category,
                      enclosure_url: imageUrl,
                      enclosure_type: 'image/jpeg',
                  }
                : null;
        })
        .filter(Boolean);

    const finalItems = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                const article = $('article.post-generic');
                const header = article.find('.header');
                header.find('.menu-share').remove();

                article.find('img').each((_, el) => {
                    const img = $(el);
                    const src = img.attr('src');
                    if (src && src.startsWith('/')) {
                        img.attr('src', baseUrl + src);
                    }
                    img.attr('style', 'max-width: 100%; height: auto;');
                    img.attr('referrerpolicy', 'no-referrer');
                });

                const description = article.html() ?? '';

                const datetime = article.find('time.date').attr('datetime');
                const pubDate = datetime ? timezone(parseDate(datetime), 0) : undefined;

                return {
                    ...item,
                    description,
                    pubDate,
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
