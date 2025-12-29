import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Media, PostResponse } from './types';

export const route: Route = {
    path: '/post/list/:sort?',
    example: '/bc3ts/post/list',
    parameters: {
        sort: '排序方式，`1` 為最新，`2` 為熱門，默认為 `1`',
    },
    features: {
        antiCrawler: true,
    },
    radar: [
        {
            source: ['web.bc3ts.net'],
        },
    ],
    name: '動態',
    maintainers: ['TonyRL'],
    handler,
};

const baseUrl = 'https://web.bc3ts.net';

const renderMedia = (media: Media[]) => renderToString(<MediaList media={media} />);

const MediaList = ({ media }: { media: Media[] }) => (
    <>
        <br />
        {media.map((m) =>
            m.type === 0 ? (
                <img src={m.media_url} alt={m.name} />
            ) : m.type === 3 ? (
                <video controls preload="metadata" poster={`https://img.bc3ts.net/video/post/upload/${m.cover}`}>
                    <source src={m.media_url} type="video/mp4" />
                </video>
            ) : null
        )}
    </>
);

async function handler(ctx) {
    const { sort = '1' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const response = await ofetch<PostResponse>('https://app.bc3ts.net/post/list/v2', {
        headers: {
            apikey: 'zlF+kaPfem%23we$2@90irpE*_RGjdw',
            app_version: '3.0.28',
            version: '2.0.0',
            'User-Agent': config.trueUA,
        },
        query: {
            limits: limit,
            sort_type: sort,
        },
    });

    const items = response.data.map((p) => ({
        title: p.title ?? p.content.split('\n')[0],
        description: p.content.replaceAll('\n', '<br>') + (p.media.length && renderMedia(p.media)),
        link: `${baseUrl}/post/${p.id}`,
        author: p.user.name,
        pubDate: parseDate(p.created_time, 'x'),
        category: p.group.name,
        upvotes: p.like_count,
        comments: p.comment_count,
    }));

    return {
        title: `爆料公社${sort === '1' ? '最新' : '熱門'}動態`,
        link: baseUrl,
        language: 'zh-TW',
        image: 'https://img.bc3ts.net/image/web/main/logo-white-new-2023.png',
        icon: 'https://img.bc3ts.net/image/web/main/logo/logo_icon_6th_2024_192x192.png',
        item: items,
    };
}
