import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base_link = 'https://cn.nikkei.com';
const host = 'https://cn.nikkei.com/industry.html';

export const route: Route = {
    path: '/industry',
    categories: ['traditional-media'],
    example: '/nikkei/industry',
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
            source: ['https://cn.nikkei.com/industry.html'],
            target: '/:category',
        },
    ],
    name: '日经中文网-产业聚焦',
    maintainers: ['Valuex'],
    handler,
    description: ``,
};

async function handler() {
    const link = host;

    const response = await got(link);
    const $ = load(response.data);

    const lists = $('div.newsDetailContent  div.newsStyle03  dl dt')
        .toArray()
        .map((el) => ({
            title: $('a', el).text().trim(),
            link: $('a', el).attr('href'),
            pubDate: timezone(parseDate($('span[class=date]', el).text()), 8),
        }));

    const items = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                const thisUrl = item.link;
                const trueLink = thisUrl.includes("http") ? thisUrl : base_link + thisUrl;
                const response = await got.get(trueLink);
                const $ = load(response.data);
                item.description = $('#contentDiv').html();
                item.pubDate = timezone(parseDate($('p.time').first().text()), 8);
                return item;
            })
        )
    );

    return {
        title: '日经新闻-产业聚焦',
        link: host,
        description: '日经新闻-产业聚焦',
        item: items,
    };
}
