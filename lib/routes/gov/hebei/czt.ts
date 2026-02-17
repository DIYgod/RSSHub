import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hebei/czt/xwdt/:category?',
    categories: ['government'],
    example: '/gov/hebei/czt/xwdt',
    parameters: { category: '分类，见下表，默认为财政动态' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '财政厅',
    maintainers: ['nczitzk'],
    handler,
    description: `| 财政动态 | 综合新闻 | 通知公告 |
| -------- | -------- | -------- |
| gzdt     | zhxw     | tzgg     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'gzdt';

    const rootUrl = 'http://czt.hebei.gov.cn';
    const currentUrl = `${rootUrl}/xwdt/${category}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('td li a[title]')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: `${rootUrl}${/^\.\.\/\.\./.test(item.attr('href')) ? item.attr('href').replace(/^\.\.\/\.\./, '') : `/xwdt/${category}${item.attr('href').replace(/^\./, '')}`}`,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.author = content('meta[name="ContentSource"]').attr('content');
                item.pubDate = parseDate(content('meta[name="PubDate"]').attr('content'));
                item.description = content('.TRS_Editor, .content').html();

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
