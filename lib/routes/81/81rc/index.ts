import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const handler = async (ctx) => {
    const { category = 'sy/gzdt_210283' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://81rc.81.cn';
    const currentUrl = new URL(category?.endsWith('/') ? `${category}/` : category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('div.left-news ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.find('a').text(),
                pubDate: timezone(parseDate(item.find('span').text()), +8),
                link: item.find('a').prop('href'),
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const description = $$('div.txt').html();

                item.title = $$('h2').text();
                item.description = description;
                item.pubDate = timezone(parseDate($$('div.time span').last().text()), +8);
                item.author = $$('div.time span').first().text();
                item.content = {
                    html: description,
                    text: $$('div.txt').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const title = $('title').text();
    const image = new URL('template/tenant207/t582/new.jpg', rootUrl).href;

    return {
        title,
        description: $('div.time').contents().first().text(),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: title.split(/-/).pop()?.trim(),
        language,
    };
};

export const route: Route = {
    path: '/81rc/:category{.+}?',
    name: '中国人民解放军专业技术人才网',
    url: '81rc.81.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/81/81rc/sy/gzdt_210283',
    parameters: { category: '分类，默认为 `sy/gzdt_210283`，即工作动态，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [工作动态](https://81rc.81.cn/sy/gzdt_210283)，网址为 \`https://81rc.81.cn/sy/gzdt_210283\`。截取 \`https://81rc.81.cn/\` 到末尾的部分 \`sy/gzdt_210283\` 作为参数填入，此时路由为 [\`/81/81rc/sy/gzdt_210283\`](https://rsshub.app/81/81rc/sy/gzdt_210283)。
:::
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
            source: ['81rc.81.cn/:category'],
            target: (params) => {
                const category = params.category;

                return `/81/81rc/${category ? `/${category}` : ''}`;
            },
        },
    ],
};
