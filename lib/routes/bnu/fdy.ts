import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/fdy/:path{.+}?',
    categories: ['university'],
    example: '/bnu/fdy/tzgg/dwjs',
    parameters: { path: '路径，默认为 `tzgg`' },
    name: '党委学生工作部辅导员发展中心',
    maintainers: ['TonyRL'],
    handler,
    description: `路径处填写对应页面 URL 中 \`https://fdy.bnu.edu.cn/\` 和 \`/index.htm\` 之间的字段。下面是一个例子。

若订阅 [通知公告 > 队伍建设](https://fdy.bnu.edu.cn/tzgg/dwjs/index.htm) 则将对应页面 URL <https://fdy.bnu.edu.cn/tzgg/dwjs/index.htm> 中 \`https://fdy.bnu.edu.cn/\` 和 \`/index.htm\` 之间的字段 \`tzgg/dwjs\` 作为路径填入。此时路由为 [\`/bnu/fdy/tzgg/dwjs\`](https://rsshub.app/bnu/fdy/tzgg/dwjs)`,
};

async function handler(ctx) {
    const baseUrl = 'http://fdy.bnu.edu.cn';
    const { path = 'tzgg' } = ctx.req.param();
    const link = `${baseUrl}/${path}/index.htm`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('.listconrl li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), link).href,
                pubDate: parseDate(item.find('.news-dates').text()),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);
                item.description = $('.listconrc-newszw').html();
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link,
        item: items,
    };
}
