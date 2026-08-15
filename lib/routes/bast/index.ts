import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:path{.+}?',
    categories: ['new-media'],
    example: '/bast/col/col31266',
    parameters: { path: '路径，默认为通知公告' },
    features: {
        antiCrawler: true,
    },
    name: '通用',
    maintainers: ['nczitzk'],
    description: `路径处填写对应页面 URL 中 \`https://www.bast.net.cn/\` 后的字段。下面是两个例子。

若订阅 [通知公告](https://www.bast.net.cn/col/col31266) 则将对应页面 URL <https://www.bast.net.cn/col/col31266> 中 \`https://www.bast.net.cn/\` 后的字段 \`col/col31266\` 作为路径填入。此时路由为 [\`/bast/col/col31266\`](https://rsshub.app/bast/col/col31266)

若订阅 [学术动态](https://www.bast.net.cn/col/col31530) 则将对应页面 URL <https://www.bast.net.cn/col/col31530> 中 \`https://www.bast.net.cn/\` 后的字段 \`col/col31530\` 作为路径填入。此时路由为 [\`/bast/col/col31530\`](https://rsshub.app/bast/col/col31530)

如果路由符合 \`/col/colXXXXX\` 的格式，可以由 [\`/bast/col/col31266\`](https://rsshub.app/bast/col/col31266) 精简为 [\`/bast/31266\`](https://rsshub.app/bast/31266)`,
    handler,
};

async function handler(ctx) {
    const colPath = ctx.req.param('path') ?? '32942';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;

    const rootUrl = 'https://www.bast.net.cn';
    const currentUrl = `${rootUrl}/${Number.isNaN(Number(colPath)) ? colPath : `col/col${colPath}`}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    let $ = load(response.data);

    $('.list-title-bif').remove();

    const title = $('title').text();
    let selection = $('a[title]');

    if (selection.length === 0) {
        $ = load($('ul.cont-list div script').first().text());

        $('.list-title-bif').remove();

        selection = $('a[title]');
    }

    let items = selection
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.text().trim(),
                link: $item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                if (/bast\.net\.cn/.test(item.link!)) {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = load(detailResponse.data);

                    item.title = content('meta[name="ArticleTitle"]').attr('content')!;
                    item.author = content('meta[name="contentSource"]').attr('content');
                    item.pubDate = timezone(parseDate(content('meta[name="pubdate"]').attr('content')!), 8);
                    item.category = [content('meta[name="ColumnName"]').attr('content')!];

                    item.description = content('.arccont').html();
                }

                return item;
            })
        )
    );

    return {
        title,
        link: currentUrl,
        item: items,
    };
}
