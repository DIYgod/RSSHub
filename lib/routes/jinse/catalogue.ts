import { load } from 'cheerio';

import type { Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

const categories = {
    zhengce: '政策',
    fenxishishuo: '行情',
    defi: 'DeFi',
    kuang: '矿业',
    '以太坊2.0': '以太坊 2.0',
    industry: '产业',
    IPFS: 'IPFS',
    tech: '技术',
    baike: '百科',
    capitalmarket: '研报',
};

export const route: Route = {
    path: '/:category?',
    categories: ['finance'],
    example: '/jinse/zhengce',
    parameters: { category: '分类，见下表，默认为政策' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '分类',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    description: `| 政策    | 行情         | DeFi | 矿业  | 以太坊 2.0 |
| ------- | ------------ | ---- | ----- | ---------- |
| zhengce | fenxishishuo | defi | kuang | 以太坊 2.0 |

| 产业     | IPFS | 技术 | 百科  | 研报          |
| -------- | ---- | ---- | ----- | ------------- |
| industry | IPFS | tech | baike | capitalmarket |`,
};

async function handler(ctx) {
    const { category = 'zhengce' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 50);

    const rootUrl = 'https://www.jinse.com.cn';
    const rootApiUrl = 'https://api.jinse.com.cn';
    const apiUrl = new URL('v6/www/information/list', rootApiUrl).href;
    const currentUrl = rootUrl;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            catelogue_key: category,
            limit,
            flag: 'up',
        },
    });

    let items = response.list.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.extra.topic_url.replace(/\/\/(?:www\.|m\.)?jinse\.com(?:\.cn)?(?=\/)/, '//www.jinse.com.cn'),
        description: renderDescription({
            images:
                item.extra.thumbnails_pics.length > 0
                    ? item.extra.thumbnails_pics.map((p) => ({
                          src: p.replace(/_[^\W_]+(\.\w+)$/, '_true$1'),
                      }))
                    : undefined,
            intro: item.extra.summary,
        }),
        author: item.extra.nickname,
        guid: `jinse${/\/lives\//.test(item.extra.topic_url) ? '-lives' : ''}-${item.extra.topic_id}`,
        pubDate: parseTimestamp(item.extra.published_at),
        upvotes: item.extra.up_counts ?? 0,
        downvotes: item.extra.down_counts ?? 0,
        comments: item.extra.comment_count ?? 0,
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (/\/lives\//.test(item.link)) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.description += renderDescription({
                    description: (content('section.js-article-content').html() || content('div.js-article').html()) ?? undefined,
                });
                item.category = content('section.js-article-tag_state_1 a span')
                    .toArray()
                    .map((c) => content(c).text());

                return item;
            })
        )
    );

    const currentResponse = await ofetch.raw<string>(currentUrl, { redirect: 'manual' });
    const metadataHtml = currentResponse.status === 200 ? (currentResponse._data ?? '') : '';
    const $ = load(metadataHtml);

    const author = $('meta[name="author"]').prop('content') || '金色财经';
    const image = $('a.js-logoBox img').prop('src');
    const iconHref = $('link[rel="favicon"]').prop('href');
    const icon = iconHref ? new URL(iconHref, rootUrl).href : undefined;

    return {
        item: items,
        title: `${author} - ${Object.hasOwn(categories, category) ? categories[category] : category}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: ($('html').prop('lang') || 'zh-CN') as Language,
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
    };
}

function parseTimestamp(value?: number | string): Date | undefined {
    const date = value !== undefined && value !== '' ? parseDate(value, 'X') : undefined;
    return date && Number.isFinite(date.getTime()) ? date : undefined;
}
