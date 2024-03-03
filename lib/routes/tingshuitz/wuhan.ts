// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'https://www.whwater.com';

export default async (ctx) => {
    const { channelId = 68 } = ctx.req.param();
    const response = await got.post('https://manager.whwater.com:8900/website/article/findChannelArticle', {
        form: {
            channelId,
            searchKey: '',
            thumbnailStatus: 0,
            topStatus: 0,
            recommendStatus: 0,
            page: 1,
            size: ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30,
        },
    });

    const data = response.data.data;
    const items = data.articleArray.map((item) => ({
        title: item.title,
        description: item.content,
        pubDate: parseDate(item.publishTime),
        link: `https://${baseUrl}/IPolicyDetails.shtml?id=31&sid=${channelId}${item.articleLink}`,
    }));

    ctx.set('data', {
        title: `${data.channelName}通知 - 武汉市水务集团有限公司`,
        link: `${baseUrl}/IWater.shtml?id=31&sid=48`,
        item: items,
    });
};
