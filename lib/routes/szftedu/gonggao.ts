import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://ylxx.szftedu.cn/xx_5828/xygg_5832/';


export const route: Route = {
    path: '/gonggao',
    categories: ['other'],
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
    name: '园岭小学公告',
    maintainers: ['Valuex'],
    handler,
    description: ``,
};

async function handler(ctx) {
    const link = host;
    const base_link = `https://ylxx.szftedu.cn`;

    const response = await got(link);
    const $ = load(response.data);
    // const category_name = '公告';

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
                let thisUrl = item.link;
                let trueLink = thisUrl.includes("http") ? thisUrl: base_link + thisUrl;
                const response = await got.get(trueLink);
                const $ = load(response.data);
                item.description = $('body').html();
                item.pubDate = timezone(parseDate($('.item').first().text().replace('发布时间：', '')), 8);
                return item;
            })
        )
    );

    return {
        title: '园岭小学公告',
        link:host,
        description: '园岭小学公告',
        item: items,
    };
}