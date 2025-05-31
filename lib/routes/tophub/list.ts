import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';
import path from 'node:path';
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
将榜单条目集合到一个列表中，可避免推送大量条目，更符合阅读习惯且有热度排序，推荐使用。
:::`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const link = `https://tophub.today/n/${id}`;
    const response = await got.get(link, {
        headers: {
            Referer: 'https://tophub.today',
            Cookie: config.tophub.cookie,
        },
    });
    const $ = load(response.data);
    const title = $('div.Xc-ec-L.b-L').text().trim();
    const items = $('div.Zd-p-Sc > div:nth-child(1) tr')
        .toArray()
        .map((e) => ({
            title: $(e).find('td.al a').text().trim(),
            link: $(e).find('td.al a').attr('href'),
            heatRate: $(e).find('td:nth-child(3)').text().trim(),
        }));
    const combinedTitles = items.map((item) => item.title).join('');
    const renderRank = art(path.join(__dirname, 'templates/rank.art'), { items });

    return {
        title,
        link,
        item: [
            {
                title,
                link,
                description: renderRank,
                guid: combinedTitles,
            },
        ],
    };
}
