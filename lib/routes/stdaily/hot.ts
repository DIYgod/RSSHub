import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.stdaily.com/web/rdxw/node_327.html';

export const route: Route = {
    path: '/hot',
    categories: ['traditional-media'],
    example: '/stdaily/hot',
    name: '热点',
    maintainers: ['maxlixiang'],
    handler,
    url: 'www.stdaily.com/web/rdxw/node_327.html',
    radar: [
        {
            source: ['www.stdaily.com/web/rdxw/node_327.html'],
            target: '/hot',
        },
    ],
};

function extractPubDate(text: string) {
    const matched = text.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/);

    return matched ? parseDate(matched[0]) : undefined;
}

function parseList(html: string) {
    const $ = load(html);

    return $('.f_lieb_list > dl')
        .toArray()
        .map((element) => {
            const item = $(element);
            const a = item.find('h3 a').first();
            const href = a.attr('href');

            if (!href) {
                return;
            }

            const link = new URL(href, rootUrl).href;
            const image = item.find('dt img').attr('src');
            const sourceAndTime = item.find('.sourthTime span');

            return {
                title: a.text().trim(),
                link,
                image: image ? new URL(image, rootUrl).href : undefined,
                author: sourceAndTime.first().text().trim() || undefined,
                pubDate: parseDate(sourceAndTime.last().text().trim()),
            } as DataItem;
        })
        .filter((item): item is DataItem => Boolean(item));
}

async function processItem(item: DataItem) {
    return cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link!);
        const $ = load(response);

        const content = $('.pages_content .content').first().clone();
        content.find('.videoBox').remove();

        const author = $('.articleHead .f_source').first().text().trim();
        const pubDate = extractPubDate($('.articleHead .time1').first().text());

        return {
            ...item,
            author: author || item.author,
            pubDate: pubDate ?? item.pubDate,
            description: content.html()?.trim(),
        };
    });
}

async function handler() {
    const response = await ofetch(rootUrl);
    const list = parseList(response);
    const items = await Promise.all(list.map((item) => processItem(item)));

    return {
        title: '中国科技网 - 热点',
        link: rootUrl,
        image: 'https://www.stdaily.com/favicon.ico',
        item: items,
    };
}
