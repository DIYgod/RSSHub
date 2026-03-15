import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    name: '热点',
    maintainers: ['nczitzk'],
    example: '/houxu',
    path: '/',
    radar: [
        {
            source: ['houxu.app/'],
        },
    ],
    handler,
    url: 'houxu.app/',
};

async function handler(ctx) {
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
        description: renderToString(
            <>
                <h1>{item.object.title}</h1>
                <p>{item.object.summary}</p>
                <b>
                    Latest: <a href={item.object.last.link.url}>{item.object.last.link.title}</a>
                    {item.object.last.link.source || item.object.last.link.media.name ? <> ({item.object.last.link.source ?? item.object.last.link.media.name})</> : null}
                </b>
                <p>{raw(item.object.last.link.description.replaceAll('\r\n', '<br>'))}</p>
                <small>{item.object.news_update_at}</small>
            </>
        ),
    }));

    return {
        title: '后续 - 热点',
        link: rootUrl,
        item: items,
    };
}
