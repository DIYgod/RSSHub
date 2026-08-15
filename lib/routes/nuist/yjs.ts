import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/yjs/:path{.+}?',
    categories: ['university'],
    example: '/nuist/yjs/index/tzgg',
    parameters: { path: '默认为通知公告' },
    description: `路径字段处填写的是对应南京信息工程大学研究生院学科建设处分类页网址中介于 **<https://yjs.nuist.edu.cn/>** 和 **.htm** 中间的一段。

如 [南京信息工程大学研究生院学科建设处工作动态](https://yjs.nuist.edu.cn/index/gzdt.htm) 的网址为 <https://yjs.nuist.edu.cn/index/gzdt.htm，其中介于> **<https://yjs.nuist.edu.cn/>** 和 **.htm** 中间的一段为 \`index/gzdt\`。可以得到路由为 [\`/nuist/yjs/index/gzdt\`](https://rsshub.app/nuist/yjs/index/gzdt)

以下为部分分类：

| 工作动态   | 通知公告   | 招生工作  | 培养与学位 | 学生工作   |
| ---------- | ---------- | --------- | ---------- | ---------- |
| index/gzdt | index/tzgg | zsgz/sszs | xwgz/xwtz  | xsgz1/xzfc |`,
    name: '研究生院学科建设处',
    maintainers: ['gylidian', 'nczitzk'],
    handler,
};

async function handler(ctx) {
    const path = ctx.req.param('path') ?? 'index/tzgg';

    const rootUrl = 'https://yjs.nuist.edu.cn';
    const currentUrl = `${rootUrl}/${path}.htm`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.gridlinediv')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('a').last();

            return {
                title: a.text(),
                link: new URL(a.attr('href')!, currentUrl).href,
                pubDate: parseDate($item.next().text(), 'YYYY年MM月DD日'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const timeMatches = content('.bar')
                    .text()
                    .match(/(\d{4}年\d{2}月\d{2}日 \d{2}:\d{2})/);

                item.description = content('.v_news_content').html();
                item.pubDate = timeMatches ? timezone(parseDate(timeMatches[1], 'YYYY年MM月DD日 HH:mm'), 8) : item.pubDate;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
