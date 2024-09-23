import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const base_link = 'https://cn.nikkei.com';
const host = 'https://cn.nikkei.com/top/2020-08-25-06-34-55.html?types[0]=8';

export const route: Route = {
    path: '/semi',
    categories: ['traditional-media'],
    example: '/nikkei/semi',
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
            source: ['www.nikkei.com/:category/archive', 'www.nikkei.com/:category'],
            target: '/:category',
        },
    ],
    name: '日经中文网半导体',
    maintainers: ['Valuex'],
    handler,
    description: ``,
};

async function handler(ctx) {
    const link = host;

    const response = await got(link);
    const $ = load(response.data);

    const lists = $('div.newsDetailContent  div dl dt')
        .toArray()
        .map((el) => ({
            title: $('a', el).text().trim(),
            link: $('a', el).attr('href'),
            pubDate: timezone(parseDate($('dt span[class=date]', el).text()), 8),
        }));

    const items = await Promise.all(
        lists.map((item) =>
            cache.tryGet(item.link, async () => {
                let thisUrl = item.link;
                let trueLink = thisUrl.includes("http") ? thisUrl : base_link + thisUrl;
                const response = await got.get(trueLink);
                const $ = load(response.data);
                item.description = $('#contentDiv').html();
                item.pubDate = timezone(parseDate($('p.time').first().text()), 8);
                return item;
            })
        )
    );

    return {
        title: '日经新闻-半导体',
        link: host,
        description: '日经新闻-半导体',
        item: items,
    };
}