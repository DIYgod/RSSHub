import { Route } from '@/types';
import util from './utils';

export const route: Route = {
    path: '/sxw/:type',
    categories: ['forecast'],
    example: '/nua/sxw/230',
    parameters: { type: 'News Type' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['sxw.nua.edu.cn/:type/list.htm'],
    },
    name: 'Shuangxing Information',
    maintainers: ['evnydd0sf'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');

    const baseUrl = 'https://sxw.nua.edu.cn';
    const newsUrl = `${baseUrl}/${type}/list.htm`;
    const listName = 'li.list_item';
    const listDate = '.Article_PublishDate';
    const webPageName = '.Column_Anchor';

    const artiContent = '.read';
    const items = await util.ProcessList(newsUrl, baseUrl, listName, listDate, webPageName);
    const results = await util.ProcessFeed(items[0], artiContent);

    return {
        title: 'NUA-双馨网-' + items[1],
        link: newsUrl,
        description: '南京艺术学院 双馨网 ' + items[1],
        item: results,
    };
}
