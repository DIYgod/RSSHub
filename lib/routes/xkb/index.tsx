import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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

function parseSourceDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

async function fetchArticleContent(contentUrl: string): Promise<Pick<DataItem, 'description'>> {
    const detailResponse = await got({ method: 'get', url: contentUrl });
    return { description: detailResponse.data.htmlContent ?? '' };
}

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

    const list: Array<DataItem & { contentUrl: string; chnlName: string; description: string }> = response.data
        .filter((i) => i.contentUrl) // Remove "专题报道" (special report)
        .map((item) => ({
            title: item.listTitle,
            description: renderToString(
                <>
                    {item.shareImg ? (
                        <>
                            <img src={item.shareImg} />
                            <br />
                        </>
                    ) : null}
                </>
            ),
            pubDate: parseSourceDate(item.docPubTime),
            link: 'https://www.xkb.com.cn/detail?id=' + item.id,
            contentUrl: item.contentUrl,
            author: item.metaInfo.author || undefined,
            chnlName: item.metaInfo.chnlName,
        }));

    const chnlName = list[0]?.chnlName ?? '';
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`xkb:content:${item.contentUrl}`, () => fetchArticleContent(item.contentUrl));
            return {
                title: item.title,
                link: item.link,
                author: item.author,
                pubDate: item.pubDate,
                description: item.description + (detail.description ?? ''),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: `新快报新快网 - ${chnlName}`,
        link: `https://www.xkb.com.cn/home?id=${channel}`,
        item: items,
    };
}
