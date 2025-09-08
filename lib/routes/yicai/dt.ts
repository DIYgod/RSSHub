import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

const columns = {
    article: 2,
    report: 3,
    visualization: 4,
};

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
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

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

    let items = response.data.data.slice(0, limit).map((item) => {
        const enclosureUrl = item.originVideo;
        const enclosureExt = enclosureUrl.split(/\./).pop();

        return {
            title: item.newstitle,
            link: new URL(item.url, rootUrl).href,
            description: art(path.join(__dirname, 'templates/description.art'), {
                image: {
                    src: item.originPic,
                    alt: item.newstitle,
                },
                intro: item.newsnotes,
            }),
            author: item.creatername,
            category: [item.channelrootname, item.channelname, item.NewsTypeName].filter(Boolean),
            guid: `yicai-dt-${item.newsid}`,
            pubDate: parseDate(item.utc_createdate),
            updated: parseDate(item.utc_lastdate),
            enclosure_url: enclosureUrl,
            enclosure_type: enclosureUrl ? `${enclosureExt === 'mp4' ? 'video' : 'application'}/${enclosureExt}` : undefined,
            upvotes: item.newsscore ?? 0,
        };
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('div.logintips').remove();

                content('img').each((_, e) => {
                    e = content(e);

                    content(e).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: e.prop('data-original') ?? e.prop('src'),
                                alt: e.prop('alt'),
                                width: e.prop('width'),
                                height: e.prop('height'),
                            },
                        })
                    );
                });

                item.description += art(path.join(__dirname, 'templates/description.art'), {
                    description: content('div.txt').html(),
                });
                item.author = content('div.authortime h3').text();

                return item;
            })
        )
    );

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();
    const image = $('div.logo a img').prop('src');
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${$(`a[data-cid="${category}"]`).text()}${title}`,
        link: currentUrl,
        description: $('meta[name="keywords"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="description"]').prop('content'),
        author: title.split(/_/).pop(),
        allowEmpty: true,
    };
}
