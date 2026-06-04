import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const gsIndexMap = new Map([
    [0, 'xwdt.htm'],
    [1, 'xs_ts.htm'],
    [2, 'yxfc.htm'],
    [3, 'tzgg/qb.htm'],
    [4, 'tzgg/zs.htm'],
    [5, 'tzgg/py.htm'],
    [6, 'tzgg/xw.htm'],
    [7, 'tzgg/zlyzyxw.htm'],
    [8, 'tzgg/zh.htm'],
]);

export const route: Route = {
    path: '/gs/:type?',
    categories: ['university'],
    example: '/whu/gs/0',
    parameters: { type: '分类，默认为 `0`，具体参数见下表' },
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
            source: ['gs.whu.edu.cn/index.htm', 'gs.whu.edu.cn/'],
            target: '/gs',
        },
    ],
    name: '研究生院',
    maintainers: ['Delreyaa'],
    handler,
    url: 'gs.whu.edu.cn/index.htm',
    description: `| 公告类型 | 新闻动态 | 学术探索 | 院系风采 | 通知 (全部) | 通知 (招生) | 通知 (培养) | 通知 (学位) | 通知 (质量与专业学位) | 通知 (综合) |
| -------- | -------- | -------- | -------- | ----------- | ----------- | ----------- | ----------- | --------------------- | ----------- |
| 参数     | 0        | 1        | 2        | 3           | 4           | 5           | 6           | 7                     | 8           |`,
};

async function handler(ctx) {
    const host = 'https://gs.whu.edu.cn/';
    const paremType = ctx.req.param('type');
    const type = paremType ? Number.parseInt(paremType) : 0;
    const response = await got(host + gsIndexMap.get(type));

    const $ = load(response.data);
    const feed_title = $('div.location a')
        .slice(-2)
        .toArray()
        .map((element) => $(element).text())
        .join(' > ');

    let items = $('.list ul li')
        .toArray()
        .map((item) => {
            item = $(item);
            const link = item.find('a').attr('href');
            return {
                title: item.find('p').text(),
                link: link.startsWith('http') ? link : new URL(link, host).href,
                pubDate: parseDate(item.find('span').text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detail = await got(item.link);
                    const content = load(detail.data);

                    content('input').remove();
                    content('h1').remove();
                    content('h2').remove();
                    content('div.arc-tit h2').remove();
                    content('h4.information').remove();
                    content('div.arc-info').remove();
                    content('.con_xq').remove();

                    content('form[name=_newscontent_fromname] img').each((_, i) => {
                        i = $(i);
                        if (i.attr('src').startsWith('/')) {
                            i.attr('src', new URL(i.attr('src'), host).href);
                        }
                    });
                    content('form[name=_newscontent_fromname] ul li a').each((_, a) => {
                        a = $(a);
                        if (a.attr('href').startsWith('/')) {
                            a.attr('href', new URL(a.attr('href'), host).href);
                        }
                    });

                    item.description = content('form[name=_newscontent_fromname]').html();
                    return item;
                } catch {
                    item.description = 'NULL';
                    return item;
                }
            })
        )
    );

    return {
        title: `武汉大学研究生院 - ${feed_title}`,
        link: host + gsIndexMap.get(type),
        description: '武大研究生院',
        item: items,
    };
}
