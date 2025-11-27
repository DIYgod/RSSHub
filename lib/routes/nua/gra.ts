import type { Route } from '@/types';

import util from './utils';

const baseUrl = 'https://grad.nua.edu.cn';

export const route: Route = {
    path: '/gra/:type',
    categories: ['university'],
    example: '/nua/gra/1959',
    parameters: { type: 'News Type' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['grad.nua.edu.cn/:type/list.htm'],
        },
    ],
    name: 'Graduate Institute',
    maintainers: ['evnydd0sf'],
    handler,
    description: `| News Type | Parameters |
| --------- | ---------- |
| 招生工作  | 1959       |
| 培养工作  | 1962       |
| 学位工作  | 1958       |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const listName = 'li.list_item';
    const artiContent = '.read';
    const listDate = '.Article_PublishDate';
    const webPageName = '.col_title';

    const items = await util.ProcessList(newsUrl, baseUrl, listName, listDate, webPageName);
    const results = await util.ProcessFeed(items[0], artiContent);

    return {
        title: 'NUA-研究生处-' + items[1],
        link: `${baseUrl}/${type}/list.htm`,
        description: '南京艺术学院 研究生处 ' + items[1],
        item: results,
    };
}
