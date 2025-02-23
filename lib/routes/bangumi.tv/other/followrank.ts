import { Route } from '@/types';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:type/followrank',
    categories: ['anime'],
    example: '/bangumi.tv/anime/followrank',
    parameters: { type: '类型：anime - 动画，book - 图书，music - 音乐，game - 游戏，real - 三次元' },
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
    maintainers: ['honue', 'zhoukuncheng', 'NekoAria'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const url = `https://bgm.tv/${type}`;

    const response = await ofetch(url);

    const $ = load(response);

    const items = $('.featuredItems .mainItem')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const link = 'https://bgm.tv' + $item.find('a').first().attr('href');
            const imageUrl = $item
                .find('.image')
                .attr('style')
                ?.match(/url\((.*?)\)/)?.[1];
            const info = $item.find('small.grey').text();
            return {
                title: $item.find('.title').text().trim(),
                link,
                description: `<img src="${imageUrl}"><br>${info}`,
            };
        });

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
        description: `BangumiTV 首页 - 成员关注${RANK_TYPES[type]}榜`,
    };
}
