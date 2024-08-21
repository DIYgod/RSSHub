import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { getToken } from './token';
import searchPopularIllust from './api/search-popular-illust';
import searchIllust from './api/search-illust';
import { config } from '@/config';
import pixivUtils from './utils';
import { parseDate } from '@/utils/parse-date';
import ConfigNotFoundError from '@/errors/types/config-not-found';

export const route: Route = {
    path: '/search/:keyword/:order?/:mode?/:include_ai?',
    categories: ['social-media', 'popular'],
    view: ViewType.Pictures,
    example: '/pixiv/search/Nezuko/popular',
    parameters: {
        keyword: 'keyword',
        order: {
            description: 'rank mode, empty or other for time order, popular for popular order',
            default: 'date',
            options: [
                {
                    label: 'time order',
                    value: 'date',
                },
                {
                    label: 'popular order',
                    value: 'popular',
                },
            ],
        },
        mode: {
            description: 'filte R18 content',
            default: 'no',
            options: [
                {
                    label: 'only not R18',
                    value: 'safe',
                },
                {
                    label: 'only R18',
                    value: 'r18',
                },
                {
                    label: 'no filter',
                    value: 'no',
                },
            ],
        },
        include_ai: {
            description: 'whether AI-generated content is included',
            default: 'yes',
            options: [
                {
                    label: 'does not include AI-generated content',
                    value: 'no',
                },
                {
                    label: 'include AI-generated content',
                    value: 'yes',
                },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Keyword',
    maintainers: ['DIYgod'],
    handler,
};

async function handler(ctx) {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new ConfigNotFoundError('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const keyword = ctx.req.param('keyword');
    const order = ctx.req.param('order') || 'date';
    const mode = ctx.req.param('mode');
    const includeAI = ctx.req.param('include_ai');

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new ConfigNotFoundError('pixiv not login');
    }

    const response = await (order === 'popular' ? searchPopularIllust(keyword, token) : searchIllust(keyword, token));

    let illusts = response.data.illusts;
    if (mode === 'safe' || mode === '1') {
        illusts = illusts.filter((item) => item.x_restrict === 0);
    } else if (mode === 'r18' || mode === '2') {
        illusts = illusts.filter((item) => item.x_restrict === 1);
    }

    if (includeAI === 'no' || includeAI === '0') {
        illusts = illusts.filter((item) => item.illust_ai_type <= 1);
    }

    return {
        title: `${keyword} 的 pixiv ${order === 'popular' ? '热门' : ''}内容`,
        link: `https://www.pixiv.net/tags/${keyword}/artworks`,
        item: illusts.map((illust) => {
            const images = pixivUtils.getImgs(illust);
            return {
                title: illust.title,
                author: illust.user.name,
                pubDate: parseDate(illust.create_date),
                description: `${illust.caption}<br><p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/artworks/${illust.id}`,
            };
        }),
        allowEmpty: true,
    };
}
