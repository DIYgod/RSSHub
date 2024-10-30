import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';
import { config } from '@/config';
import cache from '@/utils/cache';
import asyncPool from 'tiny-async-pool';

export const route: Route = {
    path: '/default',
    categories: ['bbs'],
    example: '/guozaoke/default',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '过早客',
    maintainers: ['xiaoshame'],
    handler,
    url: 'guozaoke.com/',
};

async function handler() {
    const url = 'https://www.guozaoke.com/';
    const res = await got({
        method: 'get',
        url,
        headers: {
            Cookie: config.guozaoke.cookies,
            'User-Agent': config.ua,
        },
    });
    const $ = load(res.data);

    const list = $('div.topic-item').toArray();
    const maxItems = 20; // 最多取20个数据

    const items = list
        .slice(0, maxItems)
        .map((item) => {
            const $item = $(item);
            const title = $item.find('h3.title a').text();
            const url = $item.find('h3.title a').attr('href');
            const author = $item.find('span.username a').text();
            const lastTouched = $item.find('span.last-touched').text();
            const pubDate = parseRelativeDate(lastTouched);
            const link = url ? url.split('#')[0] : undefined;
            return link ? { title, link, author, pubDate } : undefined;
        })
        .filter((item) => item !== undefined);

    const out = [];
    for await (const result of asyncPool(2, items, (item) =>
        cache.tryGet(item.link, async () => {
            const url = `https://www.guozaoke.com${item.link}`;
            const res = await got({
                method: 'get',
                url,
                headers: {
                    Cookie: config.guozaoke.cookies,
                    'User-Agent': config.ua,
                },
            });

            const $ = load(res.data);
            let content = $('div.ui-content').html();
            content = content ? content.trim() : '';
            const comments = $('.reply-item').map((i, el) => {
                const $el = $(el);
                const comment = $el.find('span.content').text().trim();
                const author = $el.find('span.username').text();
                return {
                    comment,
                    author,
                };
            });
            if (comments && comments.length > 0) {
                for (const item of comments) {
                    content += '<br>' + item.author + ': ' + item.comment;
                }
            }
            item.description = content;
            return item;
        })
    )) {
        out.push(result);
    }

    return {
        title: '过早客',
        link: url,
        item: out,
    };
}
