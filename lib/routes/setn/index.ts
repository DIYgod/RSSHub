import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const defaultRootUrl = 'https://www.setn.com';

const rootUrls = {
    娛樂: 'https://star.setn.com',
    健康: 'https://health.setn.com',
    旅遊: 'https://travel.setn.com',
    富房網: 'https://fuhouse.setn.com',
    女孩: 'https://watch.setn.com',
};

const ids = {
    即時: '',
    熱門: 0,
    政治: 6,
    社會: 41,
    國際: 5,
    兩岸: 68,
    生活: 4,
    運動: 34,
    地方: 97,
    財經: 2,
    名家: 9,
    新奇: 42,
    科技: 7,
    汽車: 12,
    寵物: 47,
    HOT焦點: 31,
};

const getCurrentUrl = (category) => {
    const rootUrl = Object.hasOwn(rootUrls, category) ? rootUrls[category] : defaultRootUrl;

    if (Object.hasOwn(ids, category)) {
        return `${rootUrl}/ViewAll.aspx${ids[category] === '' ? '' : `?PageGroupID=${ids[category]}`}`;
    }

    return `${rootUrl}/viewall`;
};

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/setn',
    parameters: { category: '分类，见下表，默认为即時' },
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
            source: ['setn.com/ViewAll.aspx', 'setn.com/'],
            target: '',
        },
    ],
    name: '新聞',
    maintainers: ['nczitzk'],
    handler,
    url: 'setn.com/ViewAll.aspx',
    description: `| 即時 | 熱門 | 娛樂 | 政治 | 社會 |
| ---- | ---- | ---- | ---- | ---- |

| 國際 | 兩岸 | 生活 | 健康 | 旅遊 |
| ---- | ---- | ---- | ---- | ---- |

| 運動 | 地方 | 財經 | 富房網 | 名家 |
| ---- | ---- | ---- | ------ | ---- |

| 新奇 | 科技 | 汽車 | 寵物 | 女孩 | HOT 焦點 |
| ---- | ---- | ---- | ---- | ---- | -------- |`,
};

type NewsArticleLd = {
    '@type'?: string;
    articleSection?: string;
    author?: Array<{ name?: string }> | { name?: string };
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '即時';
    const limit = getRouteLimit(ctx, 42);

    const currentUrl = getCurrentUrl(category);

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('#NewsList, .newsList, .hotNewsList, .news_list_area')
        .find('.newsItems, .st-news, .all_three_list, div.title-word, .news_list_item')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const desktopTitle = $item.find('.title_pc a');
            const a = desktopTitle.length ? desktopTitle.first() : $item.find('a').last();
            const link = a.attr('href')!.replaceAll(/(\?|&)utm_campaign=.*/g, '');

            return {
                title: a.text(),
                link: link.startsWith('http') ? link : `${Object.hasOwn(rootUrls, category) ? rootUrls[category] : defaultRootUrl}${link}`,
            };
        });

    items = await pMap(
        items,
        (item) =>
            cache.tryGet(`setn:category-v5:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const head = content('script[type="application/ld+json"]')
                    .toArray()
                    .map((script): NewsArticleLd | undefined => {
                        try {
                            return JSON.parse(content(script).text());
                        } catch {
                            return undefined;
                        }
                    })
                    .find((data) => data?.['@type'] === 'NewsArticle');
                const authors = Array.isArray(head?.author) ? head.author : head?.author ? [head.author] : [];

                content('#gad_setn_innity_oop_1x1').remove();

                item.title = content('h1').text();
                item.author =
                    authors
                        .map((author) => author.name)
                        .filter(Boolean)
                        .join(', ') || content('meta[name="author"]').attr('content');
                item.category = [head?.articleSection ?? content('meta[property="article:section"]').attr('content'), ...(content('meta[name="news_keywords"]').attr('content')?.split(',') ?? [])].filter(
                    (value): value is string => typeof value === 'string' && value.length > 0
                );
                const clock = content('.article_time_box')
                    .text()
                    .match(/\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}/)?.[0];
                const publishedTime = clock ?? content('meta[property="article:published_time"]').attr('content');
                if (publishedTime) {
                    item.pubDate = clock ? timezone(parseDate(clock, 'YYYY/MM/DD HH:mm:ss'), 8) : parseDate(publishedTime);
                }
                item.description = content('.article_content_area').first().html() ?? content('.content-p, article').first().html();

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: `三立新聞網 - ${category}`,
        link: currentUrl,
        item: items,
    };
}
