import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';
import { getVideo } from './utils';

const columns = {
    article: 2,
    report: 3,
    visualization: 4,
};

function getPublicationDate(value?: string | number): Date | undefined {
    if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}

type ArticleDetails = Pick<DataItem, 'author' | 'description'>;

async function fetchArticleDetails(link: string): Promise<ArticleDetails> {
    const { data: detailResponse } = await got(link);
    const content = load(detailResponse);
    content('div.logintips').remove();
    content('img').each((_, e) => {
        const image = content(e);
        image.replaceWith(
            renderDescription({
                image: {
                    src: image.prop('data-original') ?? image.prop('src'),
                    alt: image.prop('alt'),
                    width: image.prop('width'),
                    height: image.prop('height'),
                },
            })
        );
    });
    return {
        description: renderDescription({ description: content('div.txt').html() ?? undefined }),
        author: content('div.authortime h3').text(),
    };
}

export const route: Route = {
    path: '/dt/:column?/:category?',
    categories: ['traditional-media'],
    example: '/yicai/dt/article',
    parameters: { column: '栏目，见下表，默认为文章', category: '分类，见下表，默认为全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'DT 财经',
    maintainers: ['nczitzk'],
    handler,
    description: `#### [文章](https://dt.yicai.com/article)

| 分类     | ID         |
| -------- | ---------- |
| 全部     | article/0  |
| 新流行   | article/31 |
| 新趋势   | article/32 |
| 商业黑马 | article/33 |
| 新品     | article/34 |
| 营销     | article/35 |
| 大公司   | article/36 |
| 城市生活 | article/38 |

#### [报告](https://dt.yicai.com/report)

| 分类       | ID        |
| ---------- | --------- |
| 全部       | report/0  |
| 人群观念   | report/9  |
| 人群行为   | report/22 |
| 美妆个护   | report/23 |
| 3C 数码    | report/24 |
| 营销趋势   | report/25 |
| 服饰鞋包   | report/27 |
| 互联网     | report/28 |
| 城市与居住 | report/29 |
| 消费趋势   | report/30 |
| 生活趋势   | report/37 |

#### [可视化](https://dt.yicai.com/visualization)

| 分类     | ID               |
| -------- | ---------------- |
| 全部     | visualization/0  |
| 新流行   | visualization/39 |
| 新趋势   | visualization/40 |
| 商业黑马 | visualization/41 |
| 新品     | visualization/42 |
| 营销     | visualization/43 |
| 大公司   | visualization/44 |
| 城市生活 | visualization/45 |`,
};

async function handler(ctx) {
    const { column = 'article', category = '0' } = ctx.req.param();
    if (!Object.hasOwn(columns, column)) {
        throw new InvalidParameterError('Invalid column: use article, report, or visualization');
    }

    const limit = getRouteLimit(ctx, 30);

    const rootUrl = 'https://dt.yicai.com';
    const apiUrl = new URL('api/getNewsList', rootUrl).href;
    const currentUrl = new URL(column, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            page: 1,
            rid: columns[column],
            cid: category,
            pageSize: limit,
        },
    });

    let items: Array<DataItem & { link: string }> = response.data.data.slice(0, limit).map((item) => {
        const video = getVideo(item.originVideo);
        const enclosureUrl = video?.type ? video.src : undefined;

        return {
            title: item.newstitle,
            link: new URL(item.url, rootUrl).href,
            description: renderDescription({
                image: {
                    src: item.originPic,
                    alt: item.newstitle,
                },
                intro: item.newsnotes,
            }),
            author: item.creatername,
            category: [item.channelrootname, item.channelname, item.NewsTypeName].filter(Boolean),
            guid: `yicai-dt-${item.newsid}`,
            pubDate: getPublicationDate(item.utc_createdate),
            updated: getPublicationDate(item.utc_lastdate),
            enclosure_url: enclosureUrl,
            enclosure_type: video?.type,
            upvotes: item.newsscore ?? 0,
        };
    });

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet<ArticleDetails>(`yicai:dt:article:${item.link}`, () => fetchArticleDetails(item.link));
            return {
                ...item,
                author: details.author,
                description: details.description || item.description,
            };
        },
        { concurrency: 3, stopOnError: false }
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();
    const image = $('div.logo a img').prop('src');
    const icon = new URL($('link[rel="shortcut icon"]').prop('href')!, rootUrl).href;

    return {
        item: items,
        title: `${$(`a[data-cid="${category}"]`).text()}${title}`,
        link: currentUrl,
        description: $('meta[name="keywords"]').prop('content'),
        language: 'zh' as const satisfies Language,
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="description"]').prop('content'),
        author: title.split(/_/).pop(),
    };
}
