import { Route } from '@/types';
import { load } from 'cheerio';
import { config } from '@/config';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:type/followrank',
    categories: ['anime'],
    example: '/bangumi/anime/followrank',
    parameters: { type: '类型：anime - 动画, book - 图书, music - 音乐, game - 游戏, real - 三次元' },
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
            source: ['bgm.tv/:type'],
            target: '/:type/followrank',
        },
    ],
    name: '成员关注榜',
    maintainers: ['honue', 'zhoukuncheng'],
    handler,
};

async function handler(ctx) {
    let type = ctx.req.param('type');
    if (!type || type === 'tv') {
        type = 'anime';
    }
    const url = `https://bgm.tv/${type}`;

    const response = await ofetch(url, {
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    const $ = load(response);

    const items = [
        ...$('#columnB > div:nth-child(4) > table > tbody')
            .find('tr')
            .toArray()
            .map((item) => {
                const aTag = $(item).children('td').next().find('a');
                return {
                    title: aTag.html(),
                    link: 'https://bgm.tv' + aTag.attr('href'),
                };
            }),
        ...$('#chl_subitem > ul')
            .find('li')
            .toArray()
            .map((item) => ({
                title: $(item).children('a').attr('title'),
                link: 'https://bgm.tv' + $(item).children('a').attr('href'),
            })),
    ];

    const RANK_TYPES = {
        tv: '动画',
        anime: '动画',
        book: '图书',
        music: '音乐',
        game: '游戏',
        real: '三次元',
    };

    return {
        title: `BangumiTV 成员关注${RANK_TYPES[type]}榜`,
        link: url,
        item: items,
        description: `BangumiTV 首页-成员关注${RANK_TYPES[type]}榜`,
    };
}
