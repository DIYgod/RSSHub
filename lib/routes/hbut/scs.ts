import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/scs/:type',
    categories: ['university'],
    example: '/hbut/scs/xwdt',
    parameters: { type: '分类' },
    features: {
        antiCrawler: true,
    },
    radar: [
        { title: '新闻动态', source: ['scs.hbut.edu.cn/index/xwdt.htm'], target: '/scs/xwdt' },
        { title: '通知公告', source: ['scs.hbut.edu.cn/index/tzgg.htm'], target: '/scs/tzgg' },
        { title: '教学信息', source: ['scs.hbut.edu.cn/jxxx/jxxx.htm'], target: '/scs/jxxx' },
        { title: '科研动态', source: ['scs.hbut.edu.cn/kxyj/kydt.htm'], target: '/scs/kydt' },
        { title: '党建活动', source: ['scs.hbut.edu.cn/djhd/djhd.htm'], target: '/scs/djhd' },
    ],
    name: '计算机科学与人工智能学院',
    maintainers: ['LandonLi'],
    handler,
    description: `| 新闻动态 | 通知公告 | 教学信息 | 科研动态 | 党建活动 |
| -------- | -------- | -------- | -------- | -------- |
| xwdt     | tzgg     | jxxx     | kydt     | djhd     |

::: warning
scs.hbut.edu.cn 证书链不全，自建 RSSHub 可设置环境变量 NODE\\_TLS\\_REJECT\\_UNAUTHORIZED = 0
:::`,
};

const baseUrl = 'https://scs.hbut.edu.cn';

const map = {
    xwdt: '/index/xwdt.htm',
    tzgg: '/index/tzgg.htm',
    jxxx: '/jxxx/jxxx.htm',
    kydt: '/kxyj/kydt.htm',
    djhd: '/djhd/djhd.htm',
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const link = `${baseUrl}${map[type]}`;

    const response = await ofetch(link, {
        headers: {
            Referer: link,
        },
    });

    const $ = load(response);

    return {
        link,
        title: $('title').text(),
        item: $('dl.nesw_list>dt')
            .slice(0, 10)
            .toArray()
            .map((elem) => ({
                link: new URL($('a', elem).attr('href')!, link).href,
                title: $('a', elem).text(),
                pubDate: timezone(parseDate($('font:nth-child(3)', elem).text()), 8),
            })),
    };
}
