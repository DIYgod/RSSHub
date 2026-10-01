import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

const urlPath = 'dm539/new';

export const route: Route = {
    path: '/new',
    categories: ['multimedia'],
    example: '/missav/new',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: [`missav.ws/${urlPath}`, 'missav.ws/new', 'missav.ws/'],
        },
        {
            source: [`missav.ai/${urlPath}`, 'missav.ai/new', 'missav.ai/'],
        },
    ],
    name: '最近更新',
    maintainers: ['TonyRL'],
    handler,
    url: 'missav.ws/dm397/new',
};

async function handler() {
    const baseUrl = 'https://missav.ws';
    const url = `${baseUrl}/${urlPath}`;

    const response = await ofetch(url, { minVersion: 'TLSv1.3' });

    const $ = load(response);

    const items = $('.grid .group')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('.text-secondary');
            const posterSrc = $item.find('img').attr('data-src');
            const video = $item.find('video').attr('data-src');
            if (!posterSrc || !video) {
                return null;
            }
            const poster = new URL(posterSrc);
            poster.searchParams.set('class', 'normal');
            return {
                title: title.text().trim(),
                link: title.attr('href'),
                description: renderToString(
                    <video controls preload="metadata" poster={poster.href}>
                        <source src={video} type={video.split('.').pop()} />
                    </video>
                ),
            };
        })
        .filter((item) => item !== null);

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link: baseUrl,
        item: items,
    };
}
