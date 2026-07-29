import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category{.+}?',
    categories: ['study'],
    example: '/dgjyw/tz',
    parameters: { category: '分类，见下表，默认为通知' },
    radar: [
        {
            source: ['www.dgjyw.com/:category.htm'],
            target: '/:category',
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    description: `| 通知 | 动态 | 公示 |
| ---- | ---- | ---- |
| tz   | dt   | gs   |

::: tip
分类字段处填写的是对应东莞教研网网址中介于 \`https://www.dgjyw.com/\` 和 \`.htm\` 中间的一段。

如 [通知](https://www.dgjyw.com/tz.htm) 的网址为 \`https://www.dgjyw.com/tz.htm\`，其中间字段为 \`tz\`，所以可得路由为 [\`/dgjyw/tz\`](https://rsshub.app/dgjyw/tz)；

同理，[教育科研 - 科研文件](https://www.dgjyw.com/jyky/kywj.htm) 的网址为 \`https://www.dgjyw.com/jyky/kywj.htm\`，其中间字段为 \`jyky/kywj\`，所以可得路由为 [\`/dgjyw/jyky/kywj\`](https://rsshub.app/dgjyw/jyky/kywj)。
:::`,
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'tz';

    const rootUrl = 'https://www.dgjyw.com';
    const currentUrl = `${rootUrl}/${category}.htm`;

    const response = await got(currentUrl);

    const $ = load(response.data);

    let items = $('div.text-list ul li a')
        .toArray()
        .map((item) => {
            item = $(item);

            const link = item.attr('href');

            return {
                title: item.text(),
                link: `${link.startsWith('http') ? '' : `${rootUrl}/`}${link}`,
                pubDate: parseDate(item.next().text()),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/dgjyw\.com/.test(item.link)) {
                    const detailResponse = await got(item.link);

                    const content = load(detailResponse.data);

                    content('.cont-tit').remove();
                    content('.art-body').html(content('.v_news_content').html());

                    item.pubDate = timezone(parseDate(content('meta[name="PubDate"]').attr('content')), 8);
                    item.description = content('form[name="_newscontent_fromname"]').html();
                }

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
