import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jiaowu/news/:type?',
    categories: ['university'],
    example: '/dlpu/jiaowu/news/2',
    parameters: { type: '默认为 `2`' },
    name: '教务处新闻',
    maintainers: ['xu42'],
    handler,
    description: `| 新闻资讯 | 通知公告 |
| -------- | -------- |
| 2        | 3        |`,
};

const baseUrl = 'http://jwc.dlpu.edu.cn';
const pageId = '439771';

const map = {
    2: {
        title: '新闻资讯',
        appId: '2215611',
        engineInstanceId: '3033675',
        typeId: '7219415',
        sign: 'fd3900bef92126acd65b6266aef68648',
    },
    3: {
        title: '通知公告',
        appId: '2215609',
        engineInstanceId: '3033673',
        typeId: '6484827',
        sign: '1afdefeeb641904f71205de58e6be200',
    },
};

async function handler(ctx: Context) {
    const { type = '2' } = ctx.req.param();
    const { title, appId, engineInstanceId, typeId, sign } = map[type];
    const limit = ctx.req.query('limit') ?? '10';

    const response = await ofetch(`${baseUrl}/engine2/general/${appId}/type/more-datas`, {
        method: 'POST',
        body: new URLSearchParams({
            engineInstanceId,
            sign,
            pageNum: '1',
            pageSize: limit,
            typeId,
            topTypeId: '',
            sw: '',
            typeDataSort: '-1',
        }),
    });

    return {
        link: `${baseUrl}/engine2/general/more?appId=${appId}&pageId=${pageId}&websiteId=239444&typeId=${typeId}`,
        title: `大连工业大学教务处 - ${title}`,
        item: response.data.datas.datas.map((item) => ({
            link: `${baseUrl}/engine2/d/${item.id}/${engineInstanceId}/0/${appId}?t=${typeId}&p=${pageId}`,
            title: item.title,
            pubDate: timezone(parseDate(item.publishTime), 8),
        })),
    };
}
