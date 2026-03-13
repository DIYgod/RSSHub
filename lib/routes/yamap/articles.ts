import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://yamap.com/activities/';
const host = 'https://api.yamap.com/v3/activities?page=1&per=24';

export const route: Route = {
    path: '/',
    categories: ['travel'],
    example: '/yamap',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '文章',
    maintainers: ['valuex'],
    handler,
    description: '',
};

async function handler() {
    const link = host;
    const response = await got(link);
    const metadata = response.data;
    // const recordNum = metadata.activities.length - 1 ;

    const lists = metadata.activities.map((item) => ({
        title: item.title,
        link: baseUrl + item.id.toString(),
        pubDate: parseDate(item.created_at),
        location: item.map.name || 'Japan',
    }));

    const items = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.title = item.title + '-' + item.location;
                item.description = $('div.ActivitiesId__Body main').html();
                item.pubDate = timezone(parseDate($('span[class=ActivityDetailTabLayout__Middle__Date]').text()), 8);
                return item;
            })
        )
    );

    return {
        title: 'Yamap',
        link: baseUrl,
        description: 'Yamap',
        item: items,
    };
}
