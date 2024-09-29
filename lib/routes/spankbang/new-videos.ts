import { Data, Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';

import ofetch from '@/utils/ofetch';
import * as cheerio from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';

const __dirname = getCurrentPath(import.meta.url);
const render = (data) => art(path.join(__dirname, 'templates/video.art'), data);

const handler = async () => {
    const baseUrl = 'https://spankbang.com';
    const link = `${baseUrl}/new_videos/`;

    const response = await ofetch(link, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const $ = cheerio.load(response);

    const items = $('.video-item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const thumb = $item.find('.thumb');
            const cover = $item.find('img.cover');

            return {
                title: thumb.attr('title'),
                link: new URL(thumb.attr('href')!, baseUrl).href,
                description: render({
                    cover: cover.data('src'),
                    preview: cover.data('preview'),
                }),
            };
        });

    return {
        title: $('head title').text(),
        description: $('head meta[name="description"]').attr('content'),
        link,
        item: items,
    } as unknown as Promise<Data>;
};

export const route: Route = {
    path: '/new_videos',
    categories: ['multimedia'],
    example: '/spankbang/new_videos',
    name: 'New Porn Videos',
    maintainers: ['TonyRL'],
    features: {
        antiCrawler: true,
    },
    radar: [
        {
            source: ['spankbang.com/new_videos/', 'spankbang.com/'],
        },
    ],
    handler,
};
