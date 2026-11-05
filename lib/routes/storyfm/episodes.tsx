import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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

    const list = $('.e-ep')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            const a = $item.find('h2.e-ep__title a');
            const date = $item.find('.whitespace-nowrap').text();

            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: date ? parseDate(`${date}T00:00:00Z`) : undefined,
                enclosure_type: 'audio/mpeg',
                enclosure_url: $item.find('audio source').attr('src'),
                itunes_item_image: $item.find('.zoom-image-container-progression img').attr('src'),
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`storyfm:detail:v2:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                return {
                    author: content('.rs-post__author').text().replace(/By/, '').trim(),
                    description: content('.rs-post__content').html() || '',
                };
            });
            return {
                ...item,
                author: detail.author,
                description: renderToString(
                    <>
                        {item.enclosure_url ? (
                            <audio controls>
                                <source src={item.enclosure_url} />
                            </audio>
                        ) : null}
                        {detail.description ? raw(detail.description) : null}
                    </>
                ),
            };
        },
        { concurrency: 3 }
    );

    return {
        title: '故事FM',
        link: currentUrl,
        item: items,
        itunes_author: '故事FM',
        image: $('.custom-logo-link img').attr('src'),
    };
}
