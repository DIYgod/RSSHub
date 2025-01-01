import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx) => {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://iehou.com';
    const currentUrl = new URL(category ? `page-${category}.htm` : '', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('li.list-group-item div.subject h2')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const title = item.text();

            return {
                title,
                pubDate: timezone(parseDate(item.parent().find('span').text(), 'MM-DD HH:mm', 'YYYY-MM-DD HH:mm'), +8),
                link: item.find('a').prop('href'),
                category: item
                    .nextAll('a')
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

                const title = $$('h1.title').text();
                const description = $$('div.thread-content').html();
                const image = $$('div.thread-content img').first().prop('src');

                item.title = title;
                item.description = description;
                item.pubDate = timezone(parseDate($$('i.icon-clock-o').parent().contents().last().text().trim(), 'MM-DD HH:mm', 'YYYY-MM-DD HH:mm'), +8);
                item.author = $$('img.avatar-1').parent().contents().last().text().trim();
                item.content = {
                    html: description,
                    text: $$('div.thread-content').text(),
                };
                item.image = image;
                item.banner = image;
                item.language = language;

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        description: $('meta[name="description"]').prop('content'),
        link: currentUrl,
        item: items,
        allowEmpty: true,
        author: $('h1').text(),
        language,
    };
};

export const route: Route = {
    path: '/:category?',
    name: '线报',
    url: 'iehou.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/iehou',
    parameters: { category: '分类，默认为空，即最新线报，可在对应分类页 URL 中找到' },
    description: `::: tip
  若订阅 [24小时热门线报](https://iehou.com/page-dayhot.htm)，网址为 \`https://iehou.com/page-dayhot.htm\`。截取 \`https://iehou.com/page-\` 到末尾 \`.htm\` 的部分 \`dayhot\` 作为参数填入，此时路由为 [\`/iehou/dayhot\`](https://rsshub.app/iehou/dayhot)。
:::
  
  | [最新线报](https://iehou.com/) | [24 小时热门](https://iehou.com/page-dayhot.htm) | [一周热门](https://iehou.com/page-weekhot.htm) |
  | ------------------------------ | ------------------------------------------------ | ---------------------------------------------- |
  | [](https://rsshub.app/iehou)   | [dayhot](https://rsshub.app/iehou/dayhot)        | [weekhot](https://rsshub.app/iehou/weekhot)    |
  `,
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
            title: '最新线报',
            source: ['iehou.com'],
            target: '/',
        },
        {
            title: '24小时热门',
            source: ['iehou.com/page-dayhot.htm'],
            target: '/dayhot',
        },
        {
            title: '一周热门',
            source: ['iehou.com/page-weekhot.htm'],
            target: '/weekhot',
        },
    ],
};
