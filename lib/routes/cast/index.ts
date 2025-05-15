import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const baseUrl = 'https://www.cast.org.cn';

async function parsePage(html: string) {
    return await Promise.all(
        load(html)('li')
            .toArray()
            .map((el) => {
                const title = load(el)('a');
                let articleUrl = title.attr('href');

                if (articleUrl?.startsWith('http')) {
                    return {
                        title: title.text(),
                        link: title.attr('href'),
                    };
                }
                articleUrl = `${baseUrl}${title.attr('href')}`;

                return cache.tryGet(articleUrl, async () => {
                    const res = await got.get<string>(articleUrl!);
                    const article = load(res.data);
                    const pubDate = timezone(parseDate(article('meta[name=PubDate]').attr('content')!, 'YYYY-MM-DD HH:mm'), +8);

                    return {
                        title: title.text(),
                        pubDate,
                        description: article('#zoom').html(),
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
    const { limit = 10 } = ctx.req.query();
    let link = `${baseUrl}/${column}/${subColumn}`;
    if (category) {
        link += `/${category}/index.html`;
    }
    const { data: indexData } = await got.get<string>(link);

    const $ = load(indexData);

    let items: any[] = [];

    // 新闻-视频首页特殊处理
    if (column === 'xw' && subColumn === 'SP' && !category) {
        items = await parsePage(indexData);
    } else {
        const buildUnitScript = $('script[parseType="bulidstatic"]');
        const queryUrl = `${baseUrl}${buildUnitScript.attr('url')}`;
        const queryData = JSON.parse(buildUnitScript.attr('querydata')?.replace(/'/g, '"') ?? '{}');
        queryData.paramJson = `{"pageNo":1,"pageSize":${limit}}`;

        const { data } = await got.get<{ data: { html: string } }>(queryUrl, {
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
