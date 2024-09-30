import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/eshop/jp',
    radar: [
        {
            source: ['nintendo.co.jp/software/switch/index.html', 'nintendo.co.jp/'],
        },
    ],
    name: 'Unknown',
    maintainers: [],
    handler,
    url: 'nintendo.co.jp/software/switch/index.html',
};

async function handler(ctx) {
    const response = await got('https://search.nintendo.jp/nintendo_soft/search.json', {
        searchParams: {
            opt_sshow: 1,
            fq: 'ssitu_s:onsale OR ssitu_s:preorder OR memo_bg:forced',
            limit: ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 24,
            page: 1,
            c: '50310840317994813',
            opt_osale: 1,
            opt_hard: '1_HAC',
            sort: 'sodate desc,score',
        },
    });
    const data = response.data.result.items;

    return {
        title: 'Nintendo eShop（日服）新游戏',
        link: 'https://www.nintendo.co.jp/software/switch/index.html',
        description: 'Nintendo eShop（日服）新上架的游戏',
        item: data.map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, 'templates/eshop_jp.art'), {
                item,
            }),
            link: `https://ec.nintendo.com/JP/ja/titles/${item.id}`,
            pubDate: parseDate(item.pdate),
        })),
    };
}
