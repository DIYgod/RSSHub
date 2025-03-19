import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://ylxx.szftedu.cn/xx_5828/xydt_5829/bxfbx_6371/';
const baseLink = 'https://ylxx.szftedu.cn';

export const route: Route = {
    path: '/dongtai',
    categories: ['university'],
    example: '/szftedu/dongtai',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '动态',
    maintainers: ['valuex'],
    handler,
    description: '',
};

async function handler() {
    const link = host;
    const response = await got(link);
    const $ = load(response.data);
    const lists = $('div.pagenews04 div ul li')
        .toArray()
        .map((el) => ({
            title: $('a', el).text().trim(),
            link: $('a', el).attr('href'),
            pubDate: timezone(parseDate($('span[class=canedit]', el).text()), 8),
        }));

    const items = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                const thisUrl = item.link;
                const trueLink = thisUrl.includes('http') ? thisUrl : baseLink + thisUrl;
                const response = await got(trueLink);
                const $ = load(response.data);
                item.description = thisUrl.includes('http') ? $('#page-content').html() : $('div.TRS_Editor').html();
                item.pubDate = timezone(parseDate($('#publish_time').first().text()), 8);
                return item;
            })
        )
    );

    return {
        title: '园岭小学动态',
        link: host,
        description: '园岭小学动态',
        item: items,
    };
}
