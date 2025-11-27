import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate, parseRelativeDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/author/:id',
    categories: ['reading'],
    example: '/qidian/author/9639927',
    parameters: { id: '作者 id, 可在作者页面 URL 找到' },
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
            source: ['my.qidian.com/author/:id'],
        },
    ],
    name: '作者',
    maintainers: ['miles170'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const rootUrl = 'https://my.qidian.com';
    const currentUrl = `${rootUrl}/author/${id}/`;
    const response = await got(currentUrl);
    const $ = load(response.data);
    const authorName = $('.header-msg h1').contents().first().text().trim();
    const items = $('.author-work .author-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const messageItem = item.find('.author-item-msg');
            const updatedDate = messageItem.find('.author-item-update span').text().replace('·', '').trim();

            return {
                title: messageItem.find('.author-item-title').text().trim(),
                author: authorName,
                category: messageItem.find('.author-item-exp a').first().text().trim(),
                description: art(path.join(__dirname, 'templates/description.art'), {
                    description: messageItem.find('.author-item-update a').attr('title'),
                    image: item.find('a img').attr('src'),
                }),
                pubDate: timezone(/(今|昨)/.test(updatedDate) ? parseRelativeDate(updatedDate) : parseDate(updatedDate, 'YYYY-MM-DD HH:mm'), +8),
                link: messageItem.find('.author-item-update a').attr('href'),
            };
        });

    return {
        title: `${authorName} - 起点中文网`,
        description: $('.header-msg-desc').text().trim(),
        link: currentUrl,
        item: items,
    };
}
