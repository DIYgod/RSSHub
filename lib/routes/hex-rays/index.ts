import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/hex-rays/news',
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
            source: ['hex-rays.com/', 'hex-rays.com/blog'],
        },
    ],
    name: 'News',
    maintainers: ['hellodword', 'TonyRL', 'Mas0n'],
    handler,
    url: 'hex-rays.com/',
};

async function handler(/* ctx*/): Promise<Data> {
    const link = 'https://hex-rays.com/blog/';
    const response = await got.get(link);
    const $ = load(response.data);

    const list: DataItem[] = $('article.featured-article, section.articles article.article')
        .toArray()
        .map((ele): DataItem => {
            const date = $('time[datetime]', ele).attr('datetime');
            return {
                title: $('h2 > a', ele).text(),
                link: $('h2 > a', ele).attr('href'),
                pubDate: date ? parseDateInTimezone(date, 0) : undefined,
                author: $('.author-name', ele).text(),
            };
        });

    const items: DataItem[] = await pMap(
        list,
        (item: DataItem) =>
            cache.tryGet(item.link!, async (): Promise<DataItem> => {
                const detailResponse = await got.get(item.link);
                const content = load(detailResponse.data);
                item.category = content('.topics > a')
                    .toArray()
                    .map((ele) => content(ele).text());
                item.description = content('.post-body').html();
                if (!item.pubDate) {
                    const articleData = content('script[type="application/ld+json"]')
                        .toArray()
                        .map((element) => JSON.parse(content(element).text()))
                        .find((data) => data['@type'] === 'BlogPosting');
                    if (articleData?.datePublished) {
                        item.pubDate = parseDate(articleData.datePublished);
                    }
                }
                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: 'Hex-Rays Blog',
        link,
        item: items,
        image: 'https://hex-rays.com/hubfs/Ico-logo.png',
    };
}
