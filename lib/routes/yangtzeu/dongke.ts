import { load } from 'cheerio';
import pMap from 'p-map';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/dongke/:path{.+}?',
    categories: ['university'],
    example: '/yangtzeu/dongke/yqzl/tzgg',
    parameters: { path: '路径，默认为学院新闻' },
    description: `路径处填写网址中 \`https://dongke.yangtzeu.edu.cn\` 到末尾 \`.htm\` 之间的部分，默认为学院新闻。

如订阅 [院情总览 - 通知公告](https://dongke.yangtzeu.edu.cn/yqzl/tzgg.htm)，网址为 \`https://dongke.yangtzeu.edu.cn/yqzl/tzgg.htm\`，截取 \`/yqzl/tzgg\` 作为参数，此时路由为 [\`/yangtzeu/dongke/yqzl/tzgg\`](https://rsshub.app/yangtzeu/dongke/yqzl/tzgg)。

若订阅子分类 [学生工作](https://dongke.yangtzeu.edu.cn/xsgz.htm)，网址为 \`https://dongke.yangtzeu.edu.cn/xsgz.htm\`。截取 \`https://dongke.yangtzeu.edu.cn\` 到末尾 \`.htm\` 的部分 \`/xsgz\` 作为参数，此时路由为 [\`/yangtzeu/dongke/xsgz\`](https://rsshub.app/yangtzeu/dongke/xsgz)。`,
    name: '动物科学学院',
    maintainers: ['nczitzk'],
    handler,
};

async function fetchDetails(link: string) {
    const { data: response } = await got(link);
    const content = load(response);
    const pubDate = content('p.content-info')
        .text()
        .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.[0];

    return {
        title: content('title').text(),
        description: content('div.v_news_content').html(),
        category: content('meta[name="keywords"]').prop('content')?.split(','),
        pubDate: pubDate ? parseDate(pubDate, 'YYYY-MM-DD HH:mm:ss', 8) : undefined,
    };
}

async function handler(ctx): Promise<Data> {
    const limit = getRouteLimit(ctx, 10);

    const rootUrl = 'https://dongke.yangtzeu.edu.cn';
    const currentUrl = `${rootUrl}/${ctx.req.param('path') ?? 'yqzl/xyxw'}.htm`;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.list-item li a')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.attr('title') || $item.text(),
                link: new URL($item.prop('href')!, rootUrl).href,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(`yangtzeu:dongke:article:v1:${item.link}`, () => fetchDetails(item.link!));
            return {
                title: details.title,
                link: item.link,
                description: details.description,
                category: details.category,
                pubDate: details.pubDate,
            };
        },
        { concurrency: 3 }
    );

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        language: 'zh-CN',
        image: new URL($('#head-img a img').prop('src')!, rootUrl).href,
        author: '长江大学动物科学学院',
    };
}
