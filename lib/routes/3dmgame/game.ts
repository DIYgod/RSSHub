import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { parseArticle } from './utils';

export const route: Route = {
    path: '/games/:name/:type?',
    example: '/3dmgame/games/detroitbecomehuman/news',
    parameters: { name: '游戏名字，可以在专题页的 url 中找到', type: '资讯类型，见下表，默认为 `news`' },
    radar: [
        {
            source: ['3dmgame.com/games/:name/:type'],
        },
    ],
    name: '游戏资讯',
    categories: ['game'],
    maintainers: ['sinchang', 'jacky2001114', 'HenryQW', 'lyqluis'],
    handler,
    description: `| 新闻 | 攻略 | 资源     |
| ---- | ---- | -------- |
| news | gl   | resource |`,
};

async function handler(ctx) {
    const { name, type = 'news' } = ctx.req.param();
    const url = `https://www.3dmgame.com/games/${name}/${type}/`;

    const { data: response } = await got(url);
    const $ = load(response);
    const listSelector = type === 'resource' ? $('.ZQ_Left .Llis_4 .lis li, .zq_left .rigtbox7 li').toArray() : $('.ZQ_Left .lis, .zq_left .newsleft li').toArray();

    const list = listSelector.map((i) => {
        const $i = $(i);
        const a = $i.find('a[href]').last();
        const time = $i.find('.time');
        return {
            title: a.text(),
            description: $i.find('.miaoshu').text(),
            link: a.attr('href'),
            pubDate: time.length ? parseDate(time.text().trim()) : null, // 2020-12-31
        };
    });

    const items = await Promise.all(list.map((item) => parseArticle(item)));

    return {
        title: $('head title').text().split('_', 1)[0],
        description: $('head meta[name="Description"]').attr('content'),
        link: url,
        item: items,
    };
}
