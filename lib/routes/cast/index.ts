import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.cast.org.cn';

async function parsePage(html: string) {
    const $ = load(html);
    return await Promise.all(
        $('li')
            .toArray()
            .map((el) => {
                const a = $(el).find('a');
                const heading = a.find('[title]').first();
                const title = heading.attr('title') || a.attr('title') || a.text();
                let articleUrl = a.attr('href');

                if (articleUrl?.startsWith('http')) {
                    return {
                        title,
                        link: a.attr('href'),
                    };
                }
                articleUrl = `${baseUrl}${a.attr('href')}`;

                return cache.tryGet(articleUrl, async () => {
                    const res = await got.get(articleUrl!);
                    const article = load(res.data);
                    const pubDate = timezone(parseDate(article('meta[name=PubDate]').attr('content')!, 'YYYY-MM-DD HH:mm'), 8);

                    return {
                        title,
                        pubDate,
                        description: article('#zoom, .fybjq.fyxqbjq').first().html(),
                        link: articleUrl,
                    };
                });
            })
    );
}

export const route: Route = {
    path: '/:column/:subColumn/:category?',
    categories: ['government'],
    example: '/cast/xw/tzgg/ZH',
    parameters: { column: '栏目编号，见下表', subColumn: '二级栏目编号', category: '分类' },
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
            source: ['cast.org.cn/:column/:subColumn/:category/index.html', 'cast.org.cn/:column/:subColumn/index.html'],
            target: '/:column/:subColumn/:category?',
        },
    ],
    name: '通用',
    maintainers: ['KarasuShin', 'TonyRL'],
    handler,
    description: `::: tip
在路由末尾处加上 \`?limit=限制获取数目\` 来限制获取条目数量，默认值为\`10\`
:::

| 分类     | 编码 |
| -------- | ---- |
| 全景科协 | qjkx |
| 智库     | zk   |
| 学术     | xs   |
| 科普     | kp   |
| 党建     | dj   |
| 数据     | sj   |
| 新闻     | xw   |`,
};

async function handler(ctx) {
    const { column, subColumn, category } = ctx.req.param();
    const limit = getRouteLimit(ctx, 10);
    let link = `${baseUrl}/${column}/${subColumn}`;
    if (category) {
        link += `/${category}/index.html`;
    }
    const { data: indexData } = await got.get(link);

    const $ = load(indexData);

    let items: DataItem[];

    // The video homepage contains static lists instead of a build-unit API.
    if (column === 'xw' && subColumn === 'SP' && !category) {
        items = await parsePage(indexData);
    } else {
        const buildUnitScript = $('script[parseType="bulidstatic"]');
        const queryUrl = `${baseUrl}${buildUnitScript.attr('url')}`;
        const queryData = JSON.parse(buildUnitScript.attr('querydata')?.replaceAll("'", '"') ?? '{}');
        queryData.paramJson = `{"pageNo":1,"pageSize":${limit}}`;

        const { data } = await got.get(queryUrl, {
            searchParams: new URLSearchParams(queryData),
        });

        items = await parsePage(data.data.html);
    }

    const pageTitle = $('head title').text();

    return {
        title: pageTitle,
        link,
        image: 'https://www.cast.org.cn/favicon.ico',
        item: items,
    };
}
