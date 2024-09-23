import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base_url = 'https://yamap.com/activities/';
const host = 'https://api.yamap.com/v3/activities?page=1&per=24';


export const route: Route = {
    path: '/',
    categories: ['other'],
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
    name: 'Yamap文章',
    maintainers: ['Valuex'],
    handler,
    description: ``,
};

async function handler() {
    const link = host;
    const response = await got(link);
    const metadata = response.data;
    const recordNum = metadata.activities.length - 1 ;

    const lists = metadata.activities.slice(0, recordNum).map((item) => ({
        title: item.title,
        link: base_url + item.id.toString(),
        pubDate: parseDate(item.created_at),
        location: (mountainName) => {
            try { 
                mountainName = item.map.name; }
            catch {
                mountainName = 'Japan';}
            return mountainName;
        },
    }));


    const items = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                const title = item.title;
                const tureLink = item.link;
                const response = await got.get(tureLink);
                const $ = load(response.data);
                item.title = title;
                item.description = $('div.ActivitiesId__Body main').html();
                item.pubDate = timezone(parseDate($('span[class=ActivityDetailTabLayout__Middle__Date]').text()), 8);
                return item;
            })
        )
    );

    return {
        title: 'Yamap',
        link:host,
        description: 'Yamap',
        item: items,
    };
}
