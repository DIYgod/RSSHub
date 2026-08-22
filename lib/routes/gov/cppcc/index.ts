import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:slug?',
    categories: ['government'],
    example: '/gov/cppcc',
    parameters: { slug: '见下文' },
    name: '栏目',
    maintainers: ['nczitzk'],
    description: `将目标栏目的网址拆解为 \`http://www.cppcc.gov.cn/\` 和后面的字段，去掉末尾的 \`/\` 后，把字段中的 \`/\` 替换为 \`-\`，即为该路由的 slug

如：（要闻）\`http://www.cppcc.gov.cn/zxxw/yw/\` 的网址在 \`http://www.cppcc.gov.cn/\` 后的字段是 \`zxxw/yw/\`，则对应的 slug 为 \`zxxw-yw\`，对应的路由即为 \`/gov/cppcc/zxxw-yw\``,
    handler,
};

async function handler(ctx: Context) {
    const { slug = 'zxxw-yw' } = ctx.req.param();

    const rootUrl = 'http://www.cppcc.gov.cn';
    const currentUrl = `${rootUrl}/${slug.replaceAll('-', '/')}/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list = $('#txtBox li')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, currentUrl).href,
                pubDate: timezone(parseDate($item.find('.time').text()), 8),
            };
        }) as DataItem[];

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.cnt_box .con').html();
                item.author = content('.info em').text().split('：', 2)[1];

                return item;
            })
        )
    );

    return {
        title: `${response.match(/<span style="padding:0 8px">><\/span>(.*?)<\/p>/)[1]} - 中国政协网`,
        link: currentUrl,
        item: items,
    };
}
