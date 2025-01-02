import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const rootUrl = 'https://lib.tsinghua.edu.cn';
    const currentUrl = new URL(`zydt${category ? `/${category}` : ''}.htm`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('ul.notice-list li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('div.notice-list-tt a').text(),
                pubDate: parseDate(item.find('div.notice-date').text(), 'YYYY/MM/DD'),
                link: new URL(item.find('div.notice-list-tt a').prop('href'), rootUrl).href,
                category: item
                    .find('div.notice-label')
                    .toArray()
                    .map((c) => $(c).text()),
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h2').text();
                const description = $$('div.v_news_content').html();

                item.title = title;
                item.description = description;
                item.content = {
                    html: description,
                    text: $$('div.v_news_content').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL($('div.logo a img').prop('href'), rootUrl).href;

    return {
        title,
        description: $('META[Name="keywords"]').prop('Content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: title.split(/-/).pop(),
        language,
    };
};

export const route: Route = {
    path: '/lib/zydt/:category?',
    name: '图书馆资源动态',
    url: 'lib.tsinghua.edu.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/tsinghua/lib/zydt',
    parameters: { category: '分类，默认为空，即全部，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [清华大学图书馆已购资源动态](https://lib.tsinghua.edu.cn/zydt/yg.htm)，网址为 \`https://lib.tsinghua.edu.cn/zydt/yg.htm\`。截取 \`https://lib.tsinghua.edu.cn/zydt\` 到末尾 \`.htm\` 的部分 \`yg\` 作为参数填入，此时路由为 [\`/tsinghua/lib/zydt/yg\`](https://rsshub.app/tsinghua/lib/zydt/yg)。
:::

  | 已购 | 试用 |
  | ---- | ---- |
  | yg   | sy   |
  `,
    categories: ['university'],

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
            source: ['lib.tsinghua.edu.cn/zydt/:category?'],
            target: (params) => {
                const category = params.category?.replace(/\.htm$/, '');

                return `/tsinghua/lib/zydt${category ? `/${category}` : ''}`;
            },
        },
        {
            title: '图书馆资源动态',
            source: ['lib.tsinghua.edu.cn/zydt'],
            target: '/lib/zydt',
        },
        {
            title: '图书馆已购资源动态',
            source: ['lib.tsinghua.edu.cn/zydt/yg'],
            target: '/lib/zydt/yg',
        },
        {
            title: '图书馆试用资源动态',
            source: ['lib.tsinghua.edu.cn/zydt/sy'],
            target: '/lib/zydt/sy',
        },
    ],
};
