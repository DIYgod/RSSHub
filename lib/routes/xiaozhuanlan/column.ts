import { load } from 'cheerio';
import MarkdownIt from 'markdown-it';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
        .map((item): DataItem => {
            const $item = $(item);
            $item.find('.topic-has-suggested-item').remove();
            const date = $item.find('.topic-header .timeago').attr('title');
            const pubDate = date?.trim() ? parseDate(date) : undefined;
            return {
                title: $item.find('h3').text(),
                link: new URL($item.find('.topic-body-link').attr('href')!, baseUrl).href,
                author: $item.find('.topic-header .xzl-author-lockup').text().trim(),
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`xiaozhuanlan:article:v1:${item.link}`, async () => {
                const detailResponse = await got(item.link);
                const $ = load(detailResponse.data);
                const markdown = $('.hidden_markdown_body').attr('data-summary');
                if (markdown === undefined) {
                    throw new Error(`The article page at ${item.link} does not contain its Markdown body.`);
                }

                return {
                    description: md.render(markdown),
                    category: $('.topic-tags label')
                        .toArray()
                        .map((l) => $(l).text()),
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: $('head title').text(),
        link: `${baseUrl}/${id}`,
        description: $('meta[name=description]').attr('content'),
        item: items,
    };
}
