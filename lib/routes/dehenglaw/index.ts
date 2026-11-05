import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';
import { isValidHost } from '@/utils/valid-host';

import { renderDescription } from './templates/description';

export const handler = async (ctx) => {
    const { language = 'CN', category = 'paper' } = ctx.req.param();
    if (!isValidHost(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const limit = getRouteLimit(ctx, 6);

    const rootUrl = 'https://www.dehenglaw.com';
    const pageId = { paper: '000902', publish: '000903', luntan: '000901' }[category] ?? '000901';
    const currentUrl = new URL(`${language}/${category}/0008/${pageId}.aspx`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.news_box ul li')
        .slice(0, Math.max(6, limit))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const title = $item.find('h2').text();
            const date = $item.find('span').text();
            const description = renderDescription({
                intro: $item.find('div.deheng_newscontent p').text(),
            });

            return {
                title,
                description,
                pubDate: date ? timezone(parseDate(date, 'YYYY/M/D'), 8) : undefined,
                link: $item.find('a').prop('href'),
            };
        });

    if (ctx.req.query('sorted') !== 'false') {
        items.sort((a, b) => +(b.pubDate ?? 0) - +(a.pubDate ?? 0));
    }
    items = items.slice(0, limit);

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const description =
                    item.description +
                    renderDescription({
                        description: $$('div.news_content').html() ?? undefined,
                    });
                const image = $$('div.news_content img').prop('src');

                item.description = description;
                item.author = $$('div.name h4 a').text();
                item.content = {
                    html: description,
                    text: $$('div.news_content').text(),
                };
                item.image = image;
                item.banner = image;

                return item;
            })
        )
    );

    const image = $('div.logo_content a img').prop('src');

    return {
        title: $('title')
            .text()
            .replace(/\|.*$/, () => `| ${$('li.onthis').text()}`),
        description: $('meta[name="Description"]').prop('content'),
        link: currentUrl,
        item: items,
        image,
        author: $('meta[name="Description"]').prop('content'),
    };
};

export const route: Route = {
    path: '/:language?/:category?',
    name: '德恒探索',
    url: 'dehenglaw.com',
    maintainers: ['snipersteve', 'nczitzk'],
    handler,
    example: '/dehenglaw/CN/paper',
    parameters: { language: '语言，默认为中文，即 CN，可在对应分类页 URL 中找到，可选 CN 和 EN', category: '分类，默认为专业文章，即 paper，可在对应分类页 URL 中找到' },
    description: `::: tip
若订阅 [专业文章](https://dehenglaw.com/)，网址为 \`https://www.dehenglaw.com/CN/paper/0008/000902.aspx\`。截取 \`https://dehenglaw.com/\` 到末尾 \`/0008/000902.aspx\` 的部分 \`CN/paper\` 作为参数填入，此时路由为 [\`/dehenglaw/CN/paper\`](https://rsshub.app/dehenglaw/CN/paper)。

| 专业文章 | 出版物  | 德恒论坛 |
| -------- | ------- | -------- |
| paper    | publish | luntan   |

:::`,
    categories: ['new-media'],

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
            title: '专业文章',
            source: ['dehenglaw.com/:language/paper/0008/000902.aspx'],
            target: '/:language/paper',
        },
        {
            title: '出版物',
            source: ['dehenglaw.com/:language/publish/0008/000903.aspx'],
            target: '/:language/publish',
        },
        {
            title: '德恒论坛',
            source: ['dehenglaw.com/:language/luntan/0008/000901.aspx'],
            target: '/:language/luntan',
        },
    ],
};
