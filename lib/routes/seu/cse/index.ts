import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/cse/:type?',
    categories: ['university'],
    example: '/seu/cse/xyxw',
    parameters: { type: '分类名，默认为 `xyxw`' },
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
            source: ['cse.seu.edu.cn/:type/list.htm', 'cse.seu.edu.cn/'],
        },
    ],
    name: '计算机科学与工程学院',
    maintainers: ['LogicJake'],
    handler,
    description: `| 学院新闻 | 通知公告 | 教务信息 | 就业信息 | 学工事务 |
| -------- | -------- | -------- | -------- | -------- |
| xyxw     | tzgg     | jwxx     | jyxx     | xgsw     |`,
};

async function handler(ctx) {
    const host = 'https://cse.seu.edu.cn';

    const map = {
        22535: { initial: 'xyxw' },
        22536: { initial: 'tzgg' },
        22538: { initial: 'jwxx' },
        22537: { initial: 'jyxx' },
        22539: { initial: 'xgsw' },
    };

    const { type = 22535 } = ctx.req.param();
    const id = type === 'news' ? 22535 : type.length === 4 ? Object.keys(map).find((key) => map[key].initial === type) : Number.parseInt(type); // backward compatible
    const link = new URL(`${String(id) === '22535' ? 'news' : id}/list.htm`, host).href;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('.news_list .news')
        .filter((_, item) => $(item).find('.news_title a[href]').length > 0)
        .toArray()
        .map((e): DataItem => {
            const $e = $(e);
            const a = $e.find('.news_title a');
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, host).href,
                pubDate: $e.find('.news_meta').text() ? timezone(parseDate($e.find('.news_meta').text(), 'YYYY-MM-DD'), 8) : undefined,
            };
        });

    const out = await pMap(
        list,
        async (item) => ({
            ...item,
            ...(await cache.tryGet(`seu:cse:article-v4:${item.link}`, async () => {
                let response;
                try {
                    response = await got(item.link);
                } catch (error) {
                    // intranet
                    if (error instanceof FetchError && error.response?.url.startsWith('https://newids.seu.edu.cn/')) {
                        return {};
                    }
                    throw error;
                }
                const $ = load(response.data);

                return { description: $('div.wp_articlecontent, #js_content').first().html() };
            })),
        }),
        { concurrency: 3 }
    );

    return {
        link,
        title: $('head title').text(),
        description: '东南大学计算机科学与工程学院RSS',
        item: out,
    };
}
