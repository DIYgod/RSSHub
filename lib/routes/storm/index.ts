import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
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
            source: ['storm.mg/articles'],
            target: '/articles',
        },
        {
            source: ['storm.mg/localarticles'],
            target: '/localarticles',
        },
        {
            source: ['storm.mg/history'],
            target: '/history',
        },
        {
            source: ['storm.mg/all-comment'],
            target: '/all-comment',
        },
        {
            source: ['storm.mg/category/:id'],
            target: '/category/:id',
        },
        {
            source: ['storm.mg/localarticle-category/:id'],
            target: '/localarticle-category/:id',
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

    const legacy = $('.link_title');
    const anchors = legacy.length ? legacy : $('[data-test-comp="SectionPageSectionWrapper"] a[href^="/article/"]');
    const seen = new Set<string>();
    const list: Array<DataItem & { link: string }> = anchors.toArray().flatMap((element) => {
        const anchor = $(element);
        const href = anchor.attr('href');
        if (!href || !anchor.text() || anchor.closest('[data-test-comp="SectionRankingList"]').length) {
            return [];
        }
        const link = new URL(href, rootUrl).href;
        if (seen.has(link)) {
            return [];
        }
        seen.add(link);
        return { title: anchor.text(), link };
    });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`storm:article:v2:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const content = load(response);
                content('.notify_wordings, #premium_block').remove();
                const body = content('[data-test-comp="ArticleContent"]');
                const description = body.length ? (content('[data-test-comp="ArticleCover"]').first().html() ?? '') + (body.html() ?? '') : content('#CMS_wrapper').html();
                const published = content('meta[property="article:published_time"]').attr('content') || content('meta[itemprop="datePublished"]').attr('content');
                return {
                    description,
                    author: content('meta[property="author"]').attr('content') || content('meta[property="dable:author"]').attr('content'),
                    pubDate: published ? parseDate(published) : undefined,
                    category: content('meta[name="keywords"]').attr('content')?.split(','),
                    image: content('meta[property="og:image"]').attr('content'),
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
