import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

import { rootUrl } from './utils';

export const route: Route = {
    path: '/lite/information/:category',
    categories: ['new-media'],
    example: '/36kr/lite/information/AI',
    parameters: {
        category: '分类，必填项.参考官网网址，区分大小写',
    },
    name: '资讯频道',
    maintainers: ['MilliumOrion'],
    description: `| 最新 | 推荐 | 创投 | 财经 | 汽车 | AI | 科技 | 自助报道 |
| ------- | -------- | -------- | -------- | -------- | --------| -------- | -------- |
| web_news | web_recommend | contact | ccs | travel | AI | technology | aireport |`,
    handler,
};

async function handler(ctx) {

    const category = ctx.req.param('category') ?? 'web_news';

    const currentUrl = `${rootUrl}/information/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const data = JSON.parse(response.data.match(/"itemList":(\[.*?])/)[1]);

    let items = data
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
        .filter((item) => item.itemType !== 0)
        .map((item) => {
            item = item.templateMaterial ?? item;
            return {
                title: item.widgetTitle.replaceAll(/<\/?em>/g, ''),
                author: item.author ?? item.authorRoute,
                pubDate: parseDate(item.publishTime),
                link: `${rootUrl}/p/${item.itemId}`,
                description: item.summary ?? '',
            };
        });


    return {
        title: `36氪 - ${$('title').text().split('_')[0]}`,
        link: currentUrl,
        item: items,
    };
}
