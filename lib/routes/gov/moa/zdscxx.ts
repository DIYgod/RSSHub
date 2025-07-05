import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 5;

    const domain = 'moa.gov.cn';
    const rootFrameUrl = `http://www.${domain}`;
    const rootUrl = `http://zdscxx.${domain}:8080`;
    const apiUrl = new URL('nyb/getMessages', rootUrl).href;
    const apiDetailUrl = new URL('nyb/getMessagesById', rootUrl).href;
    const currentUrl = new URL('nyb/pc/messageList.jsp', rootUrl).href;
    const frameUrl = new URL('iframe/top_sj/', rootFrameUrl).href;

    const filterForm = {};

    if (category) {
        const apiFilterUrl = new URL('nyb/getMessageFilters', rootUrl).href;

        const { data: filterResponse } = await got.post(apiFilterUrl, {
            form: {
                type: '',
                isLatestMessage: false,
            },
        });

        const filters: Record<string, string[]> = {};
        for (const f of filterResponse.result) {
            filters[f.name.trim()] = f.data.map((d) => d.name.trim());
        }

        const categories = category.split(/\//);
        for (const c of categories) {
            for (const key of Object.keys(filters)) {
                if (filters[key].includes(c)) {
                    filterForm[key] = c;
                }
            }
        }
    }

    const { data: response } = await got.post(apiUrl, {
        form: {
            page: 1,
            rows: limit,
            type: '',
            isLatestMessage: false,
            ...filterForm,
        },
    });

    let items = response.result.table.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.id,
        guid: `moa-zdscxx-${item.id}`,
        pubDate: parseDate(item.date),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.guid, async () => {
                const { data: detailResponse } = await got.post(apiDetailUrl, {
                    form: {
                        id: item.link,
                    },
                });

                const data = detailResponse.result;

                item.title = data.title;
                item.link = new URL(`nyb/pc/messageView.jsp?id=${item.link}`, rootUrl).href;
                item.description = data.content;
                item.author = data.source;
                item.pubDate = parseDate(data.date);

                return item;
            })
        )
    );

    const { data: frameResponse } = await got(frameUrl);

    const $ = load(frameResponse);

    const title = $('title').text();

    return {
        title: `${title}${category ? ` - ${category}` : ''}`,
        description: '数据',
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image: $('h1.logo a img').prop('src'),
        author: title,
    };
};

export const route: Route = {
    path: '/moa/zdscxx/:category{.+}?',
    name: '中华人民共和国农业农村部数据',
    url: 'www.moa.gov.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/gov/moa/zdscxx',
    parameters: { category: '分类，默认为全部，见下表' },
    description: `::: tip
  若订阅 [中华人民共和国农业农村部数据](http://zdscxx.moa.gov.cn:8080/nyb/pc/messageList.jsp) 的 \`价格指数\` 报告主题。此时路由为 [\`/gov/moa/zdscxx/价格指数\`](https://rsshub.app/gov/moa/zdscxx/价格指数)。

  若订阅 \`央视网\` 报告来源 的 \`蔬菜生产\` 报告主题。此时路由为 [\`/gov/moa/zdscxx/央视网/蔬菜生产\`](https://rsshub.app/gov/moa/zdscxx/央视网/蔬菜生产)。
:::

| 价格指数 | 供需形势 | 分析报告周报 | 分析报告日报 | 日历信息 | 蔬菜生产 |
| -------- | -------- | ------------ | ------------ | -------- | -------- |
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
            title: '价格指数',
            source: ['zdscxx.moa.gov.cn:8080/nyb/pc/messageList.jsp'],
            target: '/gov/moa/zdscxx/价格指数',
        },
        {
            title: '供需形势',
            source: ['zdscxx.moa.gov.cn:8080/nyb/pc/messageList.jsp'],
            target: '/gov/moa/zdscxx/供需形势',
        },
        {
            title: '分析报告周报',
            source: ['zdscxx.moa.gov.cn:8080/nyb/pc/messageList.jsp'],
            target: '/gov/moa/zdscxx/分析报告周报',
        },
        {
            title: '分析报告日报',
            source: ['zdscxx.moa.gov.cn:8080/nyb/pc/messageList.jsp'],
            target: '/gov/moa/zdscxx/分析报告日报',
        },
        {
            title: '日历信息',
            source: ['zdscxx.moa.gov.cn:8080/nyb/pc/messageList.jsp'],
            target: '/gov/moa/zdscxx/日历信息',
        },
        {
            title: '蔬菜生产',
            source: ['zdscxx.moa.gov.cn:8080/nyb/pc/messageList.jsp'],
            target: '/gov/moa/zdscxx/蔬菜生产',
        },
    ],
};
