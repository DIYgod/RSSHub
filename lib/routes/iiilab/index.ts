import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

const baseUrl = 'https://www.iiilab.com/';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/iiilab',
    radar: [
        {
            source: ['www.iiilab.com/'],
            target: '',
        },
    ],
    name: '发现',
    maintainers: ['Joey'],
    handler,
    url: 'www.iiilab.com/',
};

async function handler() {
    const listingContent = await ofetch(baseUrl);
    const $ = load(listingContent);
    const item = $('.aw-common-list > div')
        .toArray()
        .map((element) => {
            const row = $(element);
            const link = row.find('a').first().attr('href');
            const value = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.exec(row.find('.text-color-999').first().text())?.[0];
            return {
                title: row.find('a').first().text(),
                link,
                description: row.find('.all-content').html(),
                pubDate: value ? parseDate(`${value.replace(' ', 'T')}:00+08:00`) : undefined,
                guid: link ? Buffer.from(link).toBase64() : undefined,
                author: row.find('.aw-user-name').text(),
            };
        });
    return { link: baseUrl, title: '发现', description: '人人都是自媒体-发现', language: 'zh-CN' as const, item };
}
