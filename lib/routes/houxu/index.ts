import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const rootUrl = 'https://houxu.app';
    const apiUrl = `${rootUrl}/api/1/records/index?limit=${ctx.req.query('limit') ?? 50}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.results.map((item) => ({
        guid: `${rootUrl}/lives/${item.object.id}#${item.object.last.id}`,
        title: item.object.title,
        link: `${rootUrl}/lives/${item.object.id}`,
        author: item.object.last.link.source ?? item.object.last.link.media.name,
        pubDate: parseDate(item.object.news_update_at),
        description: art(path.join(__dirname, 'templates/lives.art'), {
            title: item.object.title,
            description: item.object.summary,
            url: item.object.last.link.url,
            linkTitle: item.object.last.link.title,
            source: item.object.last.link.source ?? item.object.last.link.media.name,
            content: item.object.last.link.description.replaceAll('\r\n', '<br>'),
            pubDate: item.object.news_update_at,
        }),
    }));

    ctx.set('data', {
        title: '后续 - 热点',
        link: rootUrl,
        item: items,
    });
};
