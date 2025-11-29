import path from 'node:path';

import { load } from 'cheerio';
import xxhash from 'xxhash-wasm';

import { config } from '@/config';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { art } from '@/utils/render';

export const route: Route = {
    path: '/list/:id',
    categories: ['new-media'],
    example: '/tophub/list/Om4ejxvxEN',
    parameters: { id: '榜单id，可在 URL 中找到' },
    features: {
        requireConfig: [
            {
                name: 'TOPHUB_COOKIE',
                optional: true,
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['tophub.today/n/:id'],
        },
    ],
    name: '榜单列表',
    maintainers: ['akynazh'],
    handler,
    description: `::: tip
将榜单条目集合到一个列表中，且有热度排序，可避免推送大量条目。
:::`,
};

async function handler(ctx) {
    const { h64ToString } = await xxhash();
    const id = ctx.req.param('id');
    const link = `https://tophub.today/n/${id}`;
    const response = await ofetch(link, {
        headers: {
            Referer: 'https://tophub.today',
            Cookie: config.tophub?.cookie ?? '',
        },
    });
    const $ = load(response);
    const title = $('.tt h3').text().trim();
    const items = $('.rank-all-item:not(.history-content) .jc-c tr')
        .toArray()
        .map((e) => ({
            title: $(e).find('td a').text().trim(),
            link: $(e).find('td a').attr('href'),
            heatRate: $(e).find('td:nth-child(3)').text().trim(),
        }));
    const combinedTitles = items.map((item) => item.title).join('');
    const renderRank = art(path.join(__dirname, 'templates/rank.art'), { items });

    return {
        title,
        description: $('.tt p').text().trim(),
        image: $('.ii img').attr('src'),
        link,
        item: [
            {
                title,
                link,
                description: renderRank,
                guid: h64ToString(combinedTitles),
            },
        ],
    };
}
