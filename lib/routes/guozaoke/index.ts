import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseRelativeDate } from '@/utils/parse-date';
import { config } from '@/config';
import cache from '@/utils/cache';
import asyncPool from 'tiny-async-pool';

export const route: Route = {
    path: '',
    categories: ['bbs'],
    example: '/guozaoke',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'guozaoke',
    maintainers: ['xiaoshame'],
    handler,
    url: 'guozaoke.com/',
};

async function getContent(link) {
    return await cache.tryGet(link, async () => {
        const url = `https://www.guozaoke.com${link}`;
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

        return content;
    });
}

async function handler() {
    const url = `https://www.guozaoke.com/`;
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
    const items = [];
    for await (const data of asyncPool(1, list.slice(0, maxItems), async (i) => {
        const $item = $(i);
        const title = $item.find('h3.title a').text();
        const link = $item.find('h3.title a').attr('href');
        const author = $item.find('span.username a').text();
        const lastTouched = $item.find('span.last-touched').text();
        const time = parseRelativeDate(lastTouched);
        const description = await getContent(link);
        return {
            title,
            link,
            description,
            author,
            pubDate: time,
        };
    })) {
        items.push(data);
    }

    return {
        title: '过早客',
        link: url,
        item: items,
    };
}
