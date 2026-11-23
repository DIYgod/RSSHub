import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const render = ({ preview, cover }) =>
    renderToString(
        <>
            {preview ? (
                <video controls preload="metadata" poster={cover}>
                    <source src={preview} type="video/mp4" />
                </video>
            ) : null}
        </>
    );

const handler = async (): Promise<Data> => {
    const baseUrl = 'https://spankbang.com';
    const link = `${baseUrl}/new_videos/`;

    const data = await cache.tryGet(
        link,
        async () => {
            const response = await ofetch(link, { minVersion: 'TLSv1.3' });
            const $ = load(response);

            const items = $('[data-testid="video-item"]')
                .toArray()
                .map((item) => {
                    const $item = $(item);
                    const cover = $item.find('picture img');

                    return {
                        title: cover.attr('alt')!,
                        link: new URL($item.children('a').attr('href')!, baseUrl).href,
                        description: render({
                            cover: cover.attr('src'),
                            preview: $item.find('video source').attr('data-src'),
                        }),
                    };
                });

            return {
                title: $('head title').text(),
                description: $('head meta[name="description"]').attr('content'),
                item: items,
            };
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: data.title,
        description: data.description,
        link,
        item: data.item,
    };
};

export const route: Route = {
    path: '/new_videos',
    categories: ['multimedia'],
    example: '/spankbang/new_videos',
    name: 'New Porn Videos',
    maintainers: ['TonyRL'],
    features: {
        antiCrawler: true,
        nsfw: true,
    },
    radar: [
        {
            source: ['spankbang.com/new_videos/', 'spankbang.com/'],
        },
    ],
    handler,
};
