import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tyjrswt/:type',
    categories: ['government'],
    example: '/gov/hebei/tyjrswt/sxxx',
    parameters: {
        type: '分类名',
    },
    name: '退役军人事务厅',
    maintainers: ['sunshinenny'],
    handler,
    description: `| 省部要闻 | 厅内信息 | 市县信息 |
| :------: | :------: | :------: |
|   ywgz   |   tnxx   |   sxxx   |`,
};

const rootUrl = 'https://tyjrswt.hebei.gov.cn';

function loadDetail(link: string) {
    return cache.tryGet(link, async () => {
        const response = await ofetch(link);
        const $ = load(response);
        const title = $('h3').text();
        const introduce = $('body > div.container.mt40 > div > div > div.m-lg.info-style-content').html();
        const temp = $('body > div.container.mt40 > div > div > div.m-lg.text-center > div.m-b-sm')
            .text()
            .replaceAll(/[\n\r]/g, '');
        const dateTime = temp.slice(temp.indexOf('发布时间') + 5, temp.indexOf('信息来源')).trim() + ':00';

        return {
            title,
            description: introduce,
            link,
            pubDate: timezone(parseDate(dateTime), 8),
            author: temp.slice(temp.indexOf('信息来源') + 5, temp.indexOf('阅读次数')).trim(),
        };
    }) as Promise<DataItem>;
}

async function handler(ctx: Context) {
    const { type } = ctx.req.param();
    const host = `${rootUrl}/gk2/${type}/`;

    const response = await ofetch(host);
    const $ = load(response);
    const list = $(`#${type}_list > li > a`).toArray();

    const items = await Promise.all(
        list.map(async (item) => {
            const itemUrl = new URL($(item).attr('href')!, host).href;
            const other = await loadDetail(itemUrl);
            return {
                link: itemUrl,
                guid: itemUrl,
                ...other,
            };
        })
    );

    const typeName = $('h3').text();

    return {
        title: `河北省退伍军人事务厅 - ${typeName}`,
        link: host,
        description: `河北省退伍军人事务厅 - ${typeName} 更新提示`,
        item: items,
    };
}
