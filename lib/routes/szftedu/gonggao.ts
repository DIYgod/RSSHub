import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://ylxx.szftedu.cn/xx_5828/xygg_5832/';

export const route: Route = {
    path: '/gonggao',
    categories: ['university'],
    example: '/szftedu/gonggao',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '公告',
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
                const trueLink = thisUrl.includes('http') ? thisUrl : host + thisUrl.slice(1);
                const response = await got(trueLink);
                const $ = load(response.data);
                item.description = thisUrl.includes('http') ? $('#page-content').html() : $('div.TRS_Editor').html();
                item.pubDate = timezone(parseDate($('.item').first().text().replace('发布时间：', '')), 8);
                return item;
            })
        )
    );

    return {
        title: '园岭小学公告',
        link: host,
        description: '园岭小学公告',
        item: items,
    };
}
