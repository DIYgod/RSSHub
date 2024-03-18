import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    linkify: true,
});
const baseUrl = 'https://xiaozhuanlan.com';

export const route: Route = {
    path: '/column/:id',
    categories: ['new-media'],
    example: '/xiaozhuanlan/column/olddriver-selection',
    parameters: { id: '专栏 ID，可在专栏页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['xiaozhuanlan.com/:id'],
        },
    ],
    name: '专栏',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
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

    return {
        title: $('head title').text().trim(),
        link: `${baseUrl}/${id}`,
        description: $('meta[name=description]').attr('content'),
        item: items,
    };
}
