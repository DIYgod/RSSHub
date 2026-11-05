import { load } from 'cheerio';
import { html } from 'hono/html';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/search/:keyword?',
    categories: ['programming'],
    example: '/hacking8/search/rsshub',
    parameters: { keyword: '关键字，默认为空' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '搜索',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword') ?? '';

    const rootUrl = 'https://i.hacking8.com';
    const currentUrl = `${rootUrl}/search/?${new URLSearchParams({ q: keyword })}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const items = $('div.media')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const a = $item.find('div.link a');
            const date = $item.parent().parent().find('td').first().text().trim();
            const pubDate = date ? timezone(parseDate(date, 'YYYY年M月D日 HH:mm'), 8) : undefined;

            return {
                title: a.text(),
                link: new URL(a.attr('href')!, rootUrl).href,
                description: html`<pre>${$item.find('div.media-body pre').text()}</pre>`.toString(),
                pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                category: $item
                    .parent()
                    .parent()
                    .find('span.label')
                    .toArray()
                    .map((l) => $(l).text()),
            };
        });

    return {
        title: `Hacking8 安全信息流 - ${$('title')
            .text()
            .replaceAll(/总数:\d+/g, '')
            .trim()}`,
        link: currentUrl,
        item: items,
    };
}
