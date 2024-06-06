import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = 'jgzx/xwzx' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;

    const rootUrl = 'http://www.beijingprice.cn';
    const apiRootUrl = 'http://www.beijingprice.cn:8086';
    const currentUrl = new URL(category.endsWith('/') ? category : `${category}/`, rootUrl).href;
    const apiNewsUrl = new URL('price/priceInformation/MorningDayWeekNews/MorningNews', apiRootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = [];

    if (/^jgzx\/jgzb\/?$/.test(category)) {
        const { data: apiResponse } = await got(apiNewsUrl, {
            searchParams: {
                page: 1,
                jsoncallback: '',
            },
        });

        items = (JSON.parse(apiResponse.replaceAll(/^\(|\)$/g, ''))?.[0]?.Info ?? []).map((item) => ({
            title: item.Title,
            pubDate: parseDate(item.PublishDate),
            link: item.Url,
            language,
        }));
    } else {
        items = $('div.jgzx.rightcontent ul li')
            .slice(0, limit)
            .toArray()
            .map((item) => {
                item = $(item);

                const a = item.find('a');
                const link = a.prop('href');

                return {
                    title: a.text()?.trim() ?? a.prop('title'),
                    pubDate: parseDate(item.contents().last().text()),
                    link: link.startsWith('http') ? link : new URL(link, rootUrl).href,
                    language,
                };
            });
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link.includes('www.beijingprice.cn')) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('p.title').text().trim();
                const description = $$('div.news-content').html();
                const fromSplits = $$('p.from')
                    .text()
                    .split(/发布时间：/);

                item.title = title;
                item.description = description;
                item.pubDate = fromSplits?.length === 0 ? item.pubDate : parseDate(fromSplits?.pop() ?? '', 'YYYY年MM月DD日');
                item.category = $$('div.map a')
                    .toArray()
                    .map((c) => $$(c).text())
                    .slice(1);
                item.author = fromSplits?.[0]?.replace(/来源：/, '') ?? undefined;
                item.content = {
                    html: description,
                    text: $$('div.news-content').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('a.header-logo img').prop('src'), rootUrl).href;

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="keywords"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '资讯',
    url: 'beijingprice.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/beijingprice/jgzx/xwzx',
    parameters: { category: '分类，默认为 `jgzx/xwzx` 即新闻资讯，可在对应分类页 URL 中找到' },
    description: `:::tip
  若订阅 [新闻资讯](http://www.beijingprice.cn/jgzx/xwzx/)，网址为 \`http://www.beijingprice.cn/jgzx/xwzx/\`。截取 \`https://beijingprice.cn/\` 到末尾 \`/\` 的部分 \`jgzx/xwzx\` 作为参数填入，此时路由为 [\`/beijingprice/jgzx/xwzx\`](https://rsshub.app/beijingprice/jgzx/xwzx)。
  :::

  #### [价格资讯](http://www.beijingprice.cn/jgzx/xwzx/)

  | [新闻资讯](http://www.beijingprice.cn/jgzx/xwzx/)       | [工作动态](http://www.beijingprice.cn/jgzx/gzdt/)       | [各区动态](http://www.beijingprice.cn/jgzx/gqdt/)       | [通知公告](http://www.beijingprice.cn/jgzx/tzgg/)       | [价格早报](http://www.beijingprice.cn/jgzx/jgzb/)       |
  | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
  | [jgzx/xwzx](https://rsshub.app//beijingprice/jgzx/xwzx) | [jgzx/gzdt](https://rsshub.app//beijingprice/jgzx/gzdt) | [jgzx/gqdt](https://rsshub.app//beijingprice/jgzx/gqdt) | [jgzx/tzgg](https://rsshub.app//beijingprice/jgzx/tzgg) | [jgzx/jgzb](https://rsshub.app//beijingprice/jgzx/jgzb) |

  #### [综合信息](http://www.beijingprice.cn/zhxx/cbjs/)

  | [价格听证](http://www.beijingprice.cn/zhxx/jgtz/)       | [价格监测定点单位名单](http://www.beijingprice.cn/zhxx/jgjcdddwmd/) | [部门预算决算](http://www.beijingprice.cn/bmys/) |
  | ------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
  | [zhxx/jgtz](https://rsshub.app//beijingprice/zhxx/jgtz) | [zhxx/jgjcdddwmd](https://rsshub.app//beijingprice/zhxx/jgjcdddwmd) | [bmys](https://rsshub.app//beijingprice/bmys)    |
`,
    categories: ['government'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['beijingprice.cn/:category?'],
            target: (params) => {
                const category = params.category;

                return `/beijingprice${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '价格资讯 - 新闻资讯',
            source: ['beijingprice.cn/jgzx/xwzx/'],
            target: '/jgzx/xwzx',
        },
        {
            title: '价格资讯 - 工作动态',
            source: ['beijingprice.cn/jgzx/gzdt/'],
            target: '/jgzx/gzdt',
        },
        {
            title: '价格资讯 - 各区动态',
            source: ['beijingprice.cn/jgzx/gqdt/'],
            target: '/jgzx/gqdt',
        },
        {
            title: '价格资讯 - 通知公告',
            source: ['beijingprice.cn/jgzx/tzgg/'],
            target: '/jgzx/tzgg',
        },
        {
            title: '价格资讯 - 价格早报',
            source: ['beijingprice.cn/jgzx/jgzb/'],
            target: '/jgzx/jgzb',
        },
        {
            title: '综合信息 - 价格听证',
            source: ['beijingprice.cn/zhxx/jgtz/'],
            target: '/zhxx/jgtz',
        },
        {
            title: '综合信息 - 价格监测定点单位名单',
            source: ['beijingprice.cn/zhxx/jgjcdddwmd/'],
            target: '/zhxx/jgjcdddwmd',
        },
        {
            title: '综合信息 - 部门预算决算',
            source: ['beijingprice.cn/bmys/'],
            target: '/bmys',
        },
    ],
};
