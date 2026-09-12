import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:type',
    categories: ['government'],
    example: '/gov/mva/bnxx',
    parameters: {
        type: '分类名',
    },
    name: '中华人民共和国退役军人事务部',
    maintainers: ['sunshinenny'],
    handler,
    description: `| 部内信息 | 政策解读 |
| :------: | :------: |
|   bnxx   |   zcjd   |`,
};

function loadDetail(link: string) {
    return cache.tryGet(link, async (): Promise<DataItem> => {
        const response = await ofetch(link);
        const $ = load(response);
        const title = $('#main > div.outerlayer > div > div > h2 > p').text();
        const introduce = $('#div_zhengwen > div').html();
        const info = $('#main > div.outerlayer > div > div > div.article-info').contents().first().text();
        const dateTime =
            info
                .slice(info.indexOf('时间：') + 3, info.indexOf('来源：'))
                .trim()
                .replace('年', '-')
                .replace('月', '-')
                .replace('日', '') + ':00';

        return {
            title,
            description: introduce,
            link,
            pubDate: timezone(parseDate(dateTime), 8),
            author: info.slice(info.indexOf('来源：') + 3).trim(),
        };
    });
}

const pages = {
    bnxx: 'https://www.mva.gov.cn/sy/xx/bnxx/',
    zcjd: 'https://www.mva.gov.cn/jiedu/zcjd/',
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const checkType = {
        bnxx: '部内信息',
        zcjd: '政策解读',
    };
    const page = pages[type];
    const response = await ofetch(page);

    const $ = load(response);
    const list = $('#main > div.overview.container.clearfix > div.overview-right.fr > div > div.public_list_team > ul > li  > a').toArray();

    const items = await Promise.all(
        list.map(async (item) => {
            const itemUrl = new URL($(item).attr('href')!, page).href;
            const other = await loadDetail(itemUrl);
            return {
                link: itemUrl,
                guid: itemUrl,
                ...other,
            };
        })
    );

    return {
        title: `中华人民共和国退役军人事务部 - ${checkType[type]}`,
        link: page,
        description: `中华人民共和国退役军人事务部 - ${checkType[type]} 更新提示`,
        item: items,
    };
}
