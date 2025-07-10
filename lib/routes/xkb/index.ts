import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/:channel',
    categories: ['traditional-media'],
    example: '/xkb/350',
    parameters: { channel: '栏目 ID，点击对应栏目后在地址栏找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '新闻',
    maintainers: ['TimWu007'],
    handler,
    description: `常用栏目 ID：

| 栏目名 | ID  |
| ------ | --- |
| 首页   | 350 |
| 重点   | 359 |
| 广州   | 353 |
| 湾区   | 360 |
| 天下   | 355 |`,
};

async function handler(ctx) {
    const channel = ctx.req.param('channel') ?? 350;
    const currentUrl = `https://www.xkb.com.cn/xkbapp/fundapi/article/api/articles?chnlId=${channel}&visibility=1&page=0&size=20&keyword=`;

    const { data: response } = await got({
        method: 'get',
        url: currentUrl,
        headers: {
            siteId: 35,
        },
    });

    const list = response.data
        .filter((i) => i.contentUrl) // Remove "专题报道" (special report)
        .map((item) => ({
            title: item.listTitle,
            description: art(path.join(__dirname, 'templates/description.art'), {
                thumb: item.shareImg,
            }),
            pubDate: timezone(parseDate(item.operTime), +8),
            link: 'https://www.xkb.com.cn/detail?id=' + item.id,
            contentUrl: item.contentUrl,
            author: item.metaInfo.author,
            chnlName: item.metaInfo.chnlName,
        }));

    let chnlName = '';

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.contentUrl, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.contentUrl,
                });
                item.description += detailResponse.data.htmlContent ?? '';
                chnlName = chnlName === '' ? item.chnlName : chnlName;
                return item;
            })
        )
    );

    return {
        title: `新快报新快网 - ${chnlName}`,
        link: `https://www.xkb.com.cn/home?id=${channel}`,
        item: items,
    };
}
