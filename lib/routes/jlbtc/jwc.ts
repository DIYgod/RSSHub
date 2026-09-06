import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwc/:category{.+}?',
    categories: ['university'],
    example: '/jlbtc/jwc',
    parameters: { category: '分类，见下表，默认为通知公告' },
    name: '教务处',
    maintainers: ['nczitzk'],
    description: `| 教务新闻   | 通知公告   | 教务管理  | 教师发展 | 学籍考务工作 | 教学建设 |
| ---------- | ---------- | --------- | -------- | ------------ | -------- |
| index/tpxw | index/tzgg | szdw/jwgl | jjj      | xjkwgz       | zyjs     |`,
    handler,
};

async function handler(ctx: Context): Promise<Data> {
    const { category = 'index/tzgg' } = ctx.req.param();

    const rootUrl = 'https://jwc1.jlbtc.edu.cn';
    const currentUrl = `${rootUrl}/${category}.htm`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('li a[target="_blank"]')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, currentUrl).href,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                item.description = content('.v_news_content').html();
                item.pubDate = timezone(parseDate(content('.timestyle2172').text()), 8);

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
