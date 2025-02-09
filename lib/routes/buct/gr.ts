import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import type { Context } from 'hono';

export const route: Route = {
    path: '/gr/:type',
    categories: ['university'],
    example: '/buct/gr/jzml',
    parameters: {
        type: {
            type: 'string',
            optional: false,
            description: '信息类型，可选值：tzgg（通知公告），jzml（简章目录），xgzc（相关政策）',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        { source: ['graduate.buct.edu.cn/1392/list.htm'], target: '/buct/gr/tzgg' },
        { source: ['graduate.buct.edu.cn/jzml/list.htm'], target: '/buct/gr/jzml' },
        { source: ['graduate.buct.edu.cn/1393/list.htm'], target: '/buct/gr/xgzc' },
    ],
    name: '研究生院',
    maintainers: ['Epic_Creeper'],
    handler,
    url: 'buct.edu.cn/',
};

async function handler(ctx: Context) {
    const type = ctx.req.param('type');
    const rootUrl = 'https://graduate.buct.edu.cn';
    let currentUrl;

    switch (type) {
        case 'tzgg':
            currentUrl = `${rootUrl}/1392/list.htm`;

            break;

        case 'jzml':
            currentUrl = `${rootUrl}/jzml/list.htm`;

            break;

        case 'xgzc':
            currentUrl = `${rootUrl}/1393/list.htm`;

            break;

        default:
            throw new Error('Invalid type parameter');
    }

    const response = await got.get(currentUrl);

    const $ = load(response.data);
    const list = $('ul.wp_article_list > li.list_item')
        .map((_, item) => ({
            pubDate: $(item).find('.Article_PublishDate').text(),
            title: $(item).find('a').attr('title'),
            link: `${rootUrl}${$(item).find('a').attr('href')}`,
        }))
        .toArray();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = load(detailResponse.data);
                item.description = content('.wp_articlecontent').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
