import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:watch_type?/:list_type?',
    categories: ['other'],
    example: '/bandbbs/mi4',
    parameters: { watch_type: '手环型号, 默认为 `小米手环4`', list_type: '列表类型, 默认为 `最新上传`' },
    name: '表盘更新',
    maintainers: ['hoilc'],
    handler,
    description: `表盘型号

| 小米手环 4 | 华米 GTR 47mm | 华米智能手表青春版 |
| ---------- | ------------- | ------------------ |
| mi4        | gtr47         | gvlite             |

列表类型

| 最新上传 | 最多下载 | 编辑推荐   |
| -------- | -------- | ---------- |
| 0        | 1        | recommends |`,
};

const watchNames = {
    mi4: '小米手环4',
    gtr47: '华米GTR 47mm',
    gvlite: '华米智能手表青春版',
};

const listNames = {
    0: '最新上传',
    1: '最多下载',
    2: '试试手气',
    recommends: '编辑推荐',
};

async function handler(ctx: Context) {
    const { watch_type = 'mi4', list_type = '0' } = ctx.req.param();
    const watchName = watchNames[watch_type] ?? watch_type;
    const listName = listNames[list_type] ?? list_type;

    const response = await ofetch(`https://www.mibandtool.club/watchface/list/${list_type}/1/10`, {
        headers: {
            type: watch_type,
        },
    });
    const list = response.data;

    return {
        title: `米坛社区表盘 - ${watchName} - ${listName}`,
        link: 'https://www.bandbbs.cn/',
        item: list.map((item) => ({
            title: item.name,
            author: item.nickname,
            description: `<img src="${item.preview}" /><p>${item.desc}</p>`,
            pubDate: parseDate(item.updatedAt),
            link: 'https://www.bandbbs.cn/',
            guid: String(item.id),
        })),
    };
}
