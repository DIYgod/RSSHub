import path from 'node:path';

import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/episodes',
    categories: ['multimedia'],
    example: '/storyfm/episodes',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['storyfm.cn/episodes-list', 'storyfm.cn/'],
        },
    ],
    name: '播客',
    maintainers: ['nczitzk'],
    handler,
    url: 'storyfm.cn/episodes-list',
};

async function handler() {
    const rootUrl = 'https://storyfm.cn';
    const currentUrl = `${rootUrl}/episodes-list/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.e-ep')
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h2.e-ep__title a');

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(item.find('.whitespace-nowrap').text()),
                enclosure_type: 'audio/mpeg',
                enclosure_url: item.find('audio source').attr('src'),
                itunes_item_image: item.find('.zoom-image-container-progression img').attr('src'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.author = content('.rs-post__author').text().replace(/By/, '').trim();
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    audio: item.enclosure_url,
                    description: content('.rs-post__content').html(),
                });

                return item;
            })
        )
    );

    return {
        title: '故事FM',
        link: currentUrl,
        item: items,
        itunes_author: '故事FM',
        image: $('.custom-logo-link img').attr('src'),
    };
}
