import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const types = {
    tiobe: '编程语言',
    netcraft: '服务器',
    'db-engines': '数据库',
};

export const route: Route = {
    path: '/ranking/:type?',
    example: '/hellogithub/ranking',
    name: '榜单报告',
    maintainers: ['moke8', 'nczitzk'],
    handler,
    description: `| 编程语言 | 服务器   | 数据库     |
  | -------- | -------- | ---------- |
  | tiobe    | netcraft | db-engines |`,
};

async function handler(ctx) {
    let type = ctx.req.param('type') ?? 'tiobe';

    type = type === 'webserver' ? 'netcraft' : type === 'db' ? 'db-engines' : type;

    const rootUrl = 'https://hellogithub.com';
    const currentUrl = `${rootUrl}/report/${type}`;

    const buildResponse = await got({
        method: 'get',
        url: rootUrl,
    });

    const buildId = buildResponse.data.match(/"buildId":"(.*?)",/)[1];

    const apiUrl = `${rootUrl}/_next/data/${buildId}/zh/report/${type}.json`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const data = response.data.pageProps;

    const items = [
        {
            guid: `${type}:${data.year}${data.month}`,
            title: `${data.year}年${data.month}月${types[type]}排行榜`,
            link: currentUrl,
            pubDate: parseDate(`${data.year}-${data.month}`, 'YYYY-M'),
            description: art(path.join(__dirname, 'templates/report.art'), {
                tiobe_list: type === 'tiobe' ? data.list : undefined,
                active_list: data.active_list,
                all_list: data.all_list,
                db_list: type === 'db-engines' ? data.list : undefined,
            }),
        },
    ];

    return {
        title: `HelloGitHub - ${types[type]}排行榜`,
        link: currentUrl,
        item: items,
    };
}
