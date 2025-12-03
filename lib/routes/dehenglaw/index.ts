import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const handler = async (ctx) => {
    const { language = 'CN', category = 'paper' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 6;

    const rootUrl = 'https://www.dehenglaw.com';
    const currentUrl = new URL(`${language}/${category}/0008/000901.aspx`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('div.news_box ul li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.find('h2').text();
            const description = art(path.join(__dirname, 'templates/description.art'), {
                intro: item.find('div.deheng_newscontent p').text(),
            });

            return {
                title,
                description,
                pubDate: parseDate(item.find('span').text(), 'YYYY/M/D'),
                link: item.find('a').first().prop('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const description =
                    item.description +
                    art(path.join(__dirname, 'templates/description.art'), {
                        description: $$('div.news_content').html(),
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
            .replace(/\|.*?$/, `| ${$('li.onthis').text()}`),
        description: $('meta[name="Description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[name="Description"]').prop('content'),
    };
};

export const route: Route = {
    path: '/:language?/:category?',
    name: '德恒探索',
    url: 'dehenglaw.com',
    maintainers: ['nczitzk'],
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
