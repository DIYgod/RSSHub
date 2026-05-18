import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import utils from './utils';

export const route: Route = {
    path: '/archive/:lang?',
    categories: ['shopping'],
    example: '/furstar/archive/cn',
    parameters: { lang: '语言, 留空为jp, 支持cn, en' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['furstar.jp/:lang/archive.php', 'furstar.jp/archive.php'],
            target: '/archive/:lang',
        },
    ],
    name: '已经出售的角色列表',
    maintainers: ['NeverBehave'],
    handler,
};

async function handler(ctx) {
    const base = utils.langBase(ctx.req.param('lang'));
    const url = `${base}/archive.php`;
    const res = await got(url);
    const info = utils.fetchAllCharacters(res.data, base);

    return {
        title: 'Furstar 已出售角色',
        link: 'https://furstar.jp',
        description: 'Furstar 已经出售或预订的角色列表',
        language: ctx.req.param('lang'),
        item: info.map((e) => ({
            title: e.title,
            author: e.author.name,
            description: `<img src="${e.headImage}"/> ${utils.renderAuthor(e.author)}`,
            pubDate: parseDate(new Date().toISOString()), // No Time for now
            link: e.detailPage,
        })),
    };
}
