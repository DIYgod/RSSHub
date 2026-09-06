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
    example: '/ngd',
    parameters: { slug: '见下文' },
    name: '新闻中心',
    maintainers: ['nczitzk'],
    description: `将目标栏目的网址拆解为 \`http://www.ngd.org.cn/\` 和后面的字段，去掉 \`.htm\` 后，把后面的字段中的 \`/\` 替换为 \`-\`，即为该路由的 slug

如：（要闻动态）\`http://www.ngd.org.cn/xwzx/ywdt/index.htm\` 的网址在 \`http://www.ngd.org.cn/\` 后的字段是 \`xwzx/ywdt/index.htm\`，则对应的 slug 为 \`xwzx-ywdt-index\`，对应的路由即为 \`/ngd/xwzx-ywdt-index\``,
    handler,
};

const rootUrl = 'https://www.ngd.org.cn';

async function handler(ctx: Context) {
    const { slug = 'xwzx-ywdt-index' } = ctx.req.param();

    const currentUrl = `${rootUrl}/${slug.replaceAll('-', '/')}.htm`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const list: DataItem[] = $('.gp-ellipsis a')
        .slice(0, 15)
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: `${currentUrl.replace('/index.htm', '')}/${$item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);
                const info = content('.articleAuthor').text().split('|');

                item.author = info[0].replace('来源：', '');
                item.description = content('.gp-article').html();
                item.pubDate = timezone(parseDate(info.at(-1)!.replace('发布时间：', '')), 8);

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
