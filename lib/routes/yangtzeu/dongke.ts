import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10;

    const rootUrl = 'https://dongke.yangtzeu.edu.cn';
    const currentUrl = new URL(`/${ctx.req.param('path') ?? 'yqzl/xyxw'}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('ul.list-item li a')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('title').text();
                item.description = content('div.v_news_content').html();
                item.category = content('meta[name="keywords"]').prop('content').split(',');
                item.pubDate = timezone(
                    parseDate(
                        content('p.content-info')
                            .text()
                            .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)[1]
                    ),
                    8
                );

                return item;
            })
        )
    );

    return {
        item: items,
        title: $('title').text(),
        link: currentUrl,
        language: 'zh-cn',
        image: new URL($('#head-img a img').prop('src'), rootUrl).href,
        author: '长江大学动物科学学院',
    };
}
