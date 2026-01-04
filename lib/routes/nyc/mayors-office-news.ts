import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/mayors-office-news',
    name: "Mayor's Office News",
    maintainers: ['hkamran80'],
    example: '/nyc/mayors-office-news',
    categories: ['government'],
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
            source: ['nyc.gov/', 'nyc.gov/mayors-office/', 'nyc.gov/mayors-office/news/'],
            target: '/mayors-office-news',
        },
    ],
    handler: async () => {
        const data = await ofetch('https://www.nyc.gov/bin/nyc/articlesearch.json?pageSize=10&currentPage=1');
        const list = data.results.map((item) => ({
            title: item.title,
            link: `https://www.nyc.gov${item.link}`,
            pubDate: timezone(parseDate(item.articleDate), -5),
        }));

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const response = await ofetch(item.link);
                    const $ = load(response);

                    // Remove "Media Contact" banner
                    $('.teaser').remove();

                    // Remove `iframe` (e.g. YouTube embeds)
                    $('iframe').remove();

                    item.description = $('#body-text-section').first().html();

                    return item;
                })
            )
        );

        return {
            title: "NYC Mayor's Office News",
            link: 'https://www.nyc.gov/mayors-office/news/?',
            item: items,
        };
    },
};
