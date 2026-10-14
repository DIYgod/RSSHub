import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/html_clip/:user/:tag',
    example: '/inoreader/html_clip/1005137674/user-favorites',
    parameters: { user: 'User id, can be found in the HTML clip URL', tag: 'Tag name, can be found in the HTML clip URL' },
    categories: ['reading'],
    view: ViewType.Articles,
    name: 'HTML Clip',
    maintainers: ['IvanWng97'],
    handler,
};

async function handler(ctx) {
    const type = 'html';
    const user = ctx.req.param('user');
    const tag = ctx.req.param('tag');
    const num = getRouteLimit(ctx, 20);
    const rootUrl = 'https://www.inoreader.com/stream';
    const currentUrl = `${rootUrl}/user/${user}/tag/${tag}/view/${type}?n=${num}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const data = response.data;
    const $ = load(data);
    const entries = $('#snip_body>.article_content');

    return {
        title: $('.header_text').text(),
        link: currentUrl,
        item: entries.toArray().map((item) => {
            const header = $(item).prev();
            const pubDate = $('div.article_author .au1', header)
                .contents()
                .filter((_, e) => e.nodeType === 3)
                .text()
                .replace(/posted (on|at) /, '')
                .replace(/UTC.*/, '');
            const author = $('div.article_author span span', header).text().trim();
            const feedName = $('div.article_author a.feed_link', header).text().trim();
            const parsedDate = pubDate ? parseDate(pubDate.trim(), 'MMM DD YYYY HH:mm:ss', true) : undefined;
            return {
                title: $('a.title_link', header).text(),
                link: $('a.title_link', header).attr('href'),
                author: author ? [author, feedName].filter(Boolean).join(' via ') : undefined,
                pubDate: parsedDate && Number.isFinite(parsedDate.getTime()) ? timezone(parsedDate, 0) : undefined,
                description: $(item).html(),
            };
        }),
    };
}
