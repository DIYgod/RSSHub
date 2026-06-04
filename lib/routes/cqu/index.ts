import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jwc/:path{.+}?',
    categories: ['university'],
    example: '/cqu/jwc/index/tzgg',
    parameters: {
        path: {
            description: '路径参数，默认为 `index/tzgg`',
            default: 'index/tzgg',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jwc.cqu.edu.cn/:path'],
            target: '/jwc/:path',
        },
    ],
    name: '本科教学信息网通知',
    maintainers: ['AhsokaTano26'],
    handler,
};

async function handler(ctx) {
    const { path = 'index/tzgg' } = ctx.req.param();
    const baseUrl = 'http://jwc.cqu.edu.cn';
    const url = new URL(`${path}.htm`, baseUrl).href;

    const response = await ofetch(url);
    const $ = load(response);

    const list = $('div.page-contner.fl li.pot-r')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a.no-wrap');
            const link = new URL(a.attr('href'), url).href;
            return {
                title: a.attr('title'),
                link,
                pubDate: parseDate(item.find('span.fr').text()), // 假设日期格式是YYYY-MM-DD
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                const content = $('form[name="_newscontent_fromname"] div#vsb_content');
                item.description = content.find('div.v_news_content').html();
                return item;
            })
        )
    );

    return {
        title: $('title').text().replace(/--/, ' - '),
        link: url,
        item: items,
    };
}
