import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/app/:column?',
    categories: ['traditional-media'],
    example: '/gzdaily/app/74',
    parameters: { column: '栏目 ID，点击对应栏目后在地址栏找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '客户端',
    maintainers: ['TimWu007'],
    handler,
    description: `::: tip
在北京时间深夜可能无法获取内容。
:::

常用栏目 ID：

| 栏目名 | ID   |
| ------ | ---- |
| 首页   | 74   |
| 时局   | 374  |
| 广州   | 371  |
| 大湾区 | 397  |
| 城区   | 2980 |`,
};

async function handler(ctx) {
    const column = ctx.req.param('column') ?? 74;
    const currentUrl = `https://app.gzdaily.cn/app_if/getArticles?columnId=${column}&page=1`;

    const { data: response } = await got(currentUrl);

    const colName = response.list.find((item) => item.newstype === 0)?.colName ?? '';

    const list: Array<DataItem & { link: string; description: string }> = response.list
        .filter((i) => i.newstype === 0) // Remove special report (专题) and articles from Guangzhou Converged Media Center (新花城).
        .map((item) => {
            const pubDate = item.publishtime ? timezone(parseDate(item.publishtime), 8) : undefined;
            return {
                title: item.title,
                description: renderToString(
                    <>
                        {item.picBig ? (
                            <>
                                <img src={item.picBig} />
                                <br />
                            </>
                        ) : null}
                    </>
                ),
                pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                link: item.shareUrl,
                category: item.colName ? [item.colName] : undefined,
                author: item.arthorName,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const body = await cache.tryGet(`gzdaily:body:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                let description = '';
                if (content('.abstract').text()) {
                    content('.abstract').find('span').remove();
                    description += renderToString(<blockquote>{content('.abstract').text()}</blockquote>);
                }
                description += content('.article').html() ?? '';
                return { description };
            });
            return { ...item, description: item.description + body.description };
        },
        { concurrency: 3 }
    );

    return {
        title: `广州日报客户端 - ${colName}`,
        link: `https://www.gzdaily.cn/amucsite/web/index.html#/home/${column}`,
        item: items,
    };
}
