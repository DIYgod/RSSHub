import { load } from 'cheerio';
import type { Context } from 'hono';
import { html } from 'hono/html';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/app/:name',
    categories: ['program-update'],
    example: '/xclient/app/sketch',
    parameters: { name: '应用名, 可在应用页 URL 中找到' },
    name: '应用更新',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx: Context) {
    const { name } = ctx.req.param();

    const link = `http://xclient.info/s/${name}.html`;
    const response = await ofetch(link);

    const $ = load(response);

    return {
        title: $('title').text(),
        link,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: $('#versions tbody tr')
            .toArray()
            .map((item) => {
                const td = $(item).find('td');
                const rawDate = td.eq(2).text();
                const pubDate = rawDate ? timezone(parseDate(rawDate, 'YYYY-MM-DD', true), 8) : undefined;
                return {
                    title: td.eq(0).text(),
                    description: html`文件大小：${td.eq(3).text()}`.toString(),
                    pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
                    link,
                    guid: td.eq(0).text(),
                };
            }),
    };
}
