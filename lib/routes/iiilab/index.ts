import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
    const listingContent = await ofetch(baseUrl, { responseType: 'text' });
    const $ = load(listingContent);
    const item = $('.aw-common-list > div')
        .toArray()
        .map((element) => {
            const row = $(element);
            const link = row.find('a').first().attr('href');
            const value = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.exec(row.find('.text-color-999').first().text())?.[0];
            const date = value ? parseDate(`${value.replace(' ', 'T')}:00+08:00`) : undefined;
            return {
                title: row.find('a').first().text(),
                link,
                description: row.find('.all-content').html() ?? row.find('.markitup-box').html() ?? undefined,
                pubDate: date && !Number.isNaN(date.getTime()) ? date : undefined,
                guid: link ? Buffer.from(link).toString('base64') : undefined,
                author: row.find('.aw-user-name').first().text() || undefined,
            };
        });
    return { link: baseUrl, title: '发现', description: '人人都是自媒体-发现', language: 'zh-CN' as const, item };
}
