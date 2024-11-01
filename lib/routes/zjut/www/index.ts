import { Data, Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
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
    name: '浙江工业大学首页',
    maintainers: ['zhullyb'],
    url: 'www.zjut.edu.cn',
    handler,
    radar: [
        {
            source: ['www.zjut.edu.cn/:type/list.htm'],
            target: '/www/:type',
        },
    ],
    description: `| 板块 | 参数 |
| ------- | ------- |
| 学术动态 | xsdt_4662 |
| 三创·人物 | 4527 |
| 通知公告 | 4528 |
| 美誉工大 | 5389 |
| 智库工大 | 5390 |
| 工大校历 | 4520 |
| 校区班车 | xqbc |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const response = await ofetch(rootUrl + type + '/list.htm');
    const $ = load(response);

    const list = $('li.news.clearfix')
        .toArray()
        .map((item) => {
            const cheerioItem = $(item);
            const a = cheerioItem.find('a');

            try {
                const title = a.text() || '';
                let link = a.attr('href');
                if (!link) {
                    link = '';
                } else if (!link.startsWith('http')) {
                    link = rootUrl.slice(0, -1) + link;
                }
                const dateText = cheerioItem.find('.news_meta').text();
                if (!dateText) {
                    // This should not be included, return an empty item to filter out
                    return {
                        title: '',
                        link: '',
                        pubDate: Date.now(),
                    };
                }
                const pubDate = timezone(parseDate(dateText), +8);

                return {
                    title,
                    link,
                    pubDate,
                };
            } catch {
                return {
                    title: '',
                    link: '',
                    pubDate: Date.now(),
                };
            }
        })
        .filter((item) => item.title && item.link);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const newItem = {
                    ...item,
                    description: '',
                };
                if (host === new URL(item.link).hostname) {
                    if (new URL(item.link).pathname.startsWith('/upload')) {
                        // 链接为一个文件，直接返回链接
                        newItem.description = item.link;
                    } else {
                        const response = await ofetch(item.link);
                        const $ = load(response);
                        newItem.description = $('div.wp_articlecontent').html() || '';
                    }
                } else {
                    // 涉及到其他站点，不方便做统一的 html 解析，直接返回链接
                    newItem.description = item.link;
                }
                return newItem;
            })
        )
    );

    return {
        title: $('head > title').text() + ' - 浙江工业大学',
        link: rootUrl + type,
        item: items,
    } as Data;
}
