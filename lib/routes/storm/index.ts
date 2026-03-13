import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:category?/:id?',
    categories: ['new-media'],
    example: '/storm',
    parameters: { category: '分类，见下表，默认为新聞總覽', id: '子分类 ID，可在 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['storm.mg/:category/:id'],
        },
    ],
    name: '分类',
    maintainers: ['nczitzk'],
    handler,
    description: `| 新聞總覽 | 地方新聞      | 歷史頻道 | 評論總覽    |
| -------- | ------------- | -------- | ----------- |
| articles | localarticles | history  | all-comment |

::: tip
  支持形如 \`https://www.storm.mg/category/118\` 的路由，即 [\`/storm/category/118\`](https://rsshub.app/storm/category/118)

  支持形如 \`https://www.storm.mg/localarticle-category/s149845\` 的路由，即 [\`/storm/localarticle-category/s149845\`](https://rsshub.app/storm/localarticle-category/s149845)
:::`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'articles';
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://www.storm.mg';
    const currentUrl = `${rootUrl}/${category}${id ? `/${id}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.link_title')
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('.notify_wordings').remove();
                content('#premium_block').remove();

                item.description = content('#CMS_wrapper').html();
                item.author = content('meta[property="dable:author"]').attr('content');
                item.pubDate = parseDate(content('meta[itemprop="datePublished"]').attr('content'));

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
