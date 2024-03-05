// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const rootUrl = 'https://houxu.app';
    const apiUrl = `${rootUrl}/api/1/events?limit=${ctx.req.query('limit') ?? 50}`;
    const currentUrl = `${rootUrl}/events`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.results.map((item) => ({
        guid: `${rootUrl}/events/${item.id}#${item.last_thread.id}`,
        title: item.title,
        link: `${rootUrl}/events/${item.id}`,
        author: item.creator.name,
        category: item.tags,
        pubDate: parseDate(item.update_at),
        description: art(path.join(__dirname, 'templates/events.art'), {
            title: item.title,
            description: item.description,
            linkTitle: item.last_thread.link_title,
            content: item.last_thread.title.replaceAll('\r\n', '<br>'),
            pubDate: item.update_at,
        }),
    }));

    ctx.set('data', {
        title: '后续 - 专栏',
        link: currentUrl,
        item: items,
    });
};
