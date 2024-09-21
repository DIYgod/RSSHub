import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/html_clip/:user/:tag',
    name: 'Unknown',
    maintainers: [],
    handler,
};

async function handler(ctx) {
    const type = 'html';
    const user = ctx.req.param('user');
    const tag = ctx.req.param('tag');
    const num = ctx.req.query('limit') || 20;
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
        title: $('.header_text').text().trim(),
        link: currentUrl,
        item: entries
            .map((idx, item) => {
                const content = $(item).clone();
                const header = $(item).prev();
                const pubDate = $('div.article_author .au1', header)
                    .contents()
                    .filter((_, e) => e.nodeType === 3)
                    .text()
                    .replace(/posted (on|at) /, '')
                    .replace(/UTC.*/, '');
                return {
                    title: $('a.title_link', header).text().trim(),
                    link: $('a.title_link', header).attr('href'),
                    author: $('div.article_author span span', header).text().trim() + ' via ' + $('div.article_author a.feed_link', header).text().trim(),
                    pubDate: parseDate(pubDate, ['MMM DD YYYY HH:mm:ss', 'HH:mm:ss']),
                    description: $(content).html(),
                };
            })
            .get(),
        allowEmpty: true,
    };
}
