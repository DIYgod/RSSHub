import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.whwater.com';

export const route: Route = {
    path: '/wuhan/:channelId?',
    categories: ['forecast'],
    example: '/tingshuitz/wuhan',
    parameters: { channelId: '分类，见下表，默认为 68' },
    description: `| channelId | 分类       |
| --------- | ---------- |
| 68        | 计划性停水 |
| 69        | 突发性停水 |`,
    radar: [
        {
            source: ['whwater.com/IWater.shtml', 'whwater.com/'],
            target: '/wuhan',
        },
    ],
    name: '武汉市',
    maintainers: ['MoonBegonia'],
    handler,
    url: 'whwater.com/IWater.shtml',
};

async function handler(ctx) {
    const { channelId = 68 } = ctx.req.param();
    const requestedLimit = Number.parseInt(ctx.req.query('limit') ?? '30');
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 30;
    const response = await got.post('https://manager.whwater.com:4443/website/article/findChannelArticle', {
        form: {
            channelId,
            searchKey: '',
            thumbnailStatus: 0,
            topStatus: 0,
            recommendStatus: 0,
            page: 1,
            size: limit,
        },
    });

    const data = response.data.data;
    const items = data.articleArray.map((item) => ({
        title: item.title,
        description: item.content,
        pubDate: item.publishTime ? parseDate(`${item.publishTime} +0800`, 'YYYY-MM-DD ZZ') : undefined,
        link: item.articleLink.startsWith('&articleId=') ? `${baseUrl}/IPolicyDetails.shtml?id=31&sid=${channelId}${item.articleLink}` : new URL(item.articleLink, baseUrl).href,
    }));

    return {
        title: `${data.channelName}通知 - 武汉市水务集团有限公司`,
        link: `${baseUrl}/IWater.shtml?id=31&sid=48`,
        item: items,
    };
}
