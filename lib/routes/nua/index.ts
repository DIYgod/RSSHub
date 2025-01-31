import { Route } from '@/types';
import util from './utils';

export const route: Route = {
    path: '/index/:type',
    categories: ['university'],
    example: '/nua/index/346',
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
            source: ['index.nua.edu.cn/:type/list.htm'],
        },
    ],
    name: 'Official Information',
    maintainers: ['evnydd0sf'],
    handler,
    description: `| News Type | Parameters |
| --------- | ---------- |
| 公告      | 346        |
| 南艺要闻  | 332        |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    const baseUrl = 'https://www.nua.edu.cn';
    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const listName = 'li.news';
    const listDate = '.news_meta';
    const webPageName = '.col_title';

    const artiContent = '.read';
    const items = await util.ProcessList(newsUrl, baseUrl, listName, listDate, webPageName);
    const results = await util.ProcessFeed(items[0], artiContent);

    return {
        title: 'NUA-' + items[1],
        link: newsUrl,
        description: '南京艺术学院 ' + items[1],
        item: results,
    };
}
