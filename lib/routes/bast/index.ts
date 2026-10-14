import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const legacyColumns = {
    '31266': 'sy/tzgg',
    '32942': 'sy/tzgg',
    '31530': 'xxjl/xsdt',
};

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

若订阅 [通知公告](https://www.bast.net.cn/sy/tzgg/) 则将对应页面 URL <https://www.bast.net.cn/sy/tzgg/> 中 \`https://www.bast.net.cn/\` 后的字段 \`sy/tzgg\` 作为路径填入。此时路由为 [\`/bast/sy/tzgg\`](https://rsshub.app/bast/sy/tzgg)

若订阅 [学术动态](https://www.bast.net.cn/xxjl/xsdt/) 则将对应页面 URL <https://www.bast.net.cn/xxjl/xsdt/> 中 \`https://www.bast.net.cn/\` 后的字段 \`xxjl/xsdt\` 作为路径填入。此时路由为 [\`/bast/xxjl/xsdt\`](https://rsshub.app/bast/xxjl/xsdt)

旧栏目 \`31266\`、\`32942\`（通知公告）和 \`31530\`（学术动态）以及 \`col/colXXXXX\` 格式继续兼容。其他栏目请使用当前网站路径。`,
    handler,
};

async function handler(ctx) {
    const colPath = ctx.req.param('path') ?? '32942';
    const limit = getRouteLimit(ctx, 50);

    const rootUrl = 'https://www.bast.net.cn';
    const legacyId = colPath.match(/^(?:col\/col)?(\d+)\/?$/)?.[1];
    const currentPath = legacyId ? (legacyColumns[legacyId] ?? `col/col${legacyId}`) : colPath;
    const currentUrl = new URL(`${currentPath.replace(/\/$/, '')}/`, rootUrl).href;

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
                title: $item.attr('title') || $item.text(),
                link: new URL($item.attr('href')!, currentUrl).href,
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
                    const dateString =
                        content('meta[name="pubdate"]').attr('content') ??
                        content('.arctit p')
                            .text()
                            .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                    item.pubDate = dateString ? timezone(parseDate(dateString), 8) : undefined;
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
