// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const md = require('markdown-it')({
    linkify: true,
});
const baseUrl = 'https://xiaozhuanlan.com';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const response = await got(`${baseUrl}/${id}`);

    const $ = load(response.data);

    let items = $('.xzl-topic-item')
        .toArray()
        .map((item) => {
            item = $(item);
            item.find('.topic-has-suggested-item').remove();
            return {
                title: item.find('h3').text().trim(),
                link: new URL(item.find('.topic-body-link').attr('href'), baseUrl).href,
                author: item.find('.topic-header .xzl-author-lockup').text().trim(),
                pubDate: parseDate(item.find('.topic-header .timeago').attr('title')),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);

                item.description = md.render($('.hidden_markdown_body').attr('data-summary'));
                if ($('.topic-tags')) {
                    item.category = $('.topic-tags label')
                        .toArray()
                        .map((l) => $(l).text());
                }

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text().trim(),
        link: `${baseUrl}/${id}`,
        description: $('meta[name=description]').attr('content'),
        item: items,
    });
};
