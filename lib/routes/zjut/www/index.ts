import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.zjut.edu.cn/';
const host = 'www.zjut.edu.cn';

export const route: Route = {
    path: '/www/:type',
    categories: ['university'],
    example: '/zjut/www/4528',
    parameters: { type: '分类，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '首页',
    maintainers: ['zhullyb'],
    url: 'www.zjut.edu.cn',
    handler,
    radar: [
        {
            source: ['www.zjut.edu.cn/:type/list.htm'],
            target: '/www/:type',
        },
    ],
    description: `| 板块       | 参数       |
| ---------- | ---------- |
| 学术动态   | xsdt\\_4662 |
| 三创・人物 | 4527       |
| 通知公告   | 4528       |
| 美誉工大   | 5389       |
| 智库工大   | 5390       |
| 工大校历   | 4520       |
| 校区班车   | xqbc       |`,
};

async function handler(ctx): Promise<Data> {
    const type = ctx.req.param('type');
    const response = await ofetch(rootUrl + type + '/list.htm');
    const $ = load(response);

    const list = $('.col_news_list .news_list li.news')
        .toArray()
        .map((item) => {
            const cheerioItem = $(item);
            const a = cheerioItem.find('a');

            try {
                const title = a.text();
                let link = a.attr('href');
                if (!link) {
                    link = '';
                } else if (!link.startsWith('http')) {
                    link = rootUrl.slice(0, -1) + link;
                }
                const dateText = cheerioItem.find('.news_meta').text();
                const date = dateText.trim() ? parseDate(dateText) : undefined;
                const pubDate = date && !Number.isNaN(date.getTime()) ? timezone(date, 8) : undefined;

                return {
                    title,
                    link,
                    pubDate,
                };
            } catch {
                return {
                    title: '',
                    link: '',
                };
            }
        })
        .filter((item) => item.title && item.link);

    const items = await pMap(
        list,
        async (item) => {
            const description = await cache.tryGet(`zjut:www:details:${item.link}`, async () => {
                const newItem = {
                    description: '',
                };
                if (host === new URL(item.link).hostname) {
                    if (new URL(item.link).pathname.startsWith('/upload')) {
                        // 链接为一个文件，直接返回链接
                        newItem.description = item.link;
                    } else {
                        const response = await ofetch(item.link);
                        const $ = load(response);
                        newItem.description = $('div.wp_articlecontent').html() ?? '';
                    }
                } else {
                    // 涉及到其他站点，不方便做统一的 html 解析，直接返回链接
                    newItem.description = item.link;
                }
                return newItem.description;
            });
            return { ...item, description };
        },
        { concurrency: 3 }
    );

    return {
        title: $('head > title').text() + ' - 浙江工业大学',
        link: rootUrl + type,
        item: items,
    };
}
