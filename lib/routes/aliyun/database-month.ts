import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/database_month',
    categories: ['programming'],
    example: '/aliyun/database_month',
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
            source: ['mysql.taobao.org/monthly', 'mysql.taobao.org/'],
        },
    ],
    name: '数据库内核月报',
    maintainers: ['junbaor'],
    handler,
    url: 'mysql.taobao.org/monthly',
};

async function handler() {
    const url = 'http://mysql.taobao.org/monthly/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);

    const list = $("ul[class='posts'] > li")
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text().trim();
            const link = `http://mysql.taobao.org${element.find('a').attr('href').trim()}/`;
            return {
                title,
                description: '',
                link,
            };
        })
        .get();

    const result = await Promise.all(
        list.map((item) => {
            const link = item.link;

            return cache.tryGet(link, async () => {
                const itemReponse = await got(link);
                const itemElement = load(itemReponse.data);
                item.description = itemElement('.content').html();
                return item;
            });
        })
    );

    return {
        title: $('title').text(),
        link: url,
        item: result.reverse(),
    };
}
