import { Route } from '@/types';
import cache from '@/utils/cache';
import utils from './utils';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/characters/:lang?',
    categories: ['shopping'],
    example: '/furstar/characters/cn',
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
            source: ['furstar.jp/:lang', 'furstar.jp/'],
            target: '/characters/:lang',
        },
    ],
    name: '最新售卖角色列表',
    maintainers: ['NeverBehave'],
    handler,
};

async function handler(ctx) {
    const base = utils.langBase(ctx.req.param('lang'));
    const res = await got.get(base, {
        https: {
            rejectUnauthorized: false,
        },
    });
    const info = utils.fetchAllCharacters(res.data, base);

    const details = await Promise.all(info.map((e) => utils.detailPage(e.detailPage, cache)));

    ctx.set('json', {
        info,
    });

    return {
        title: 'Furstar 最新角色',
        link: 'https://furstar.jp',
        description: 'Furstar 最近更新的角色列表',
        language: ctx.req.param('lang'),
        item: info.map((e, i) => ({
            title: e.title,
            author: e.author.name,
            description: utils.renderDesc(details[i].desc, details[i].pics, e.author),
            pubDate: parseDate(new Date().toISOString()), // No Time for now
            link: e.detailPage,
        })),
    };
}
