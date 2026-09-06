import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://jwc.njfu.edu.cn/sy/';

const map = {
    xjfw: '校级发文',
    tzgg: '通知公告',
    sjfw: '上级发文',
    xzzq: '下载专区',
};

export const route: Route = {
    path: '/jwc/:category?',
    categories: ['university'],
    example: '/njfu/jwc/tzgg',
    parameters: { category: '省略则默认为 tzgg' },
    name: '教务处',
    maintainers: ['kiusiudeng'],
    description: `| 校级发文 | 通知公告 | 上级发文 | 下载专区 |
| -------- | -------- | -------- | -------- |
| xjfw     | tzgg     | sjfw     | xzzq     |`,
    handler,
};

async function handler(ctx: Context) {
    const { category = 'tzgg' } = ctx.req.param();
    const link = category === 'xzzq' ? 'https://jwc.njfu.edu.cn/xzzq/' : `${baseUrl}${category}/`;

    const response = await ofetch(link);
    const infolist = JSON.parse(response.match(/var dataList=(\[.*\]);\s*var pagesData/)![1])[0].infolist;

    return {
        title: `南京林业大学教务处-${map[category]}`,
        link,
        description: `南京林业大学教务处-${map[category]}`,
        item: infolist.map((info) => ({
            title: info.title,
            description: info.summary || info.title,
            pubDate: parseDate(info.releasetime),
            link: new URL(info.url, link).href,
        })),
    };
}
