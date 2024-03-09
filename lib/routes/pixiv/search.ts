import { Route } from '@/types';
import cache from '@/utils/cache';
import { getToken } from './token';
import searchPopularIllust from './api/search-popular-illust';
import searchIllust from './api/search-illust';
import { config } from '@/config';
import pixivUtils from './utils';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/search/:keyword/:order?/:mode?',
    categories: ['social-media'],
    example: '/pixiv/search/Nezuko/popular/2',
    parameters: { keyword: 'keyword', order: 'rank mode, empty or other for time order, popular for popular order', mode: 'filte R18 content' },
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
    description: `| only not R18 | only R18 | no filter      |
  | ------------ | -------- | -------------- |
  | safe         | r18      | empty or other |`,
};

async function handler(ctx) {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new Error('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const keyword = ctx.req.param('keyword');
    const order = ctx.req.param('order') || 'date';
    const mode = ctx.req.param('mode');

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new Error('pixiv not login');
    }

    const response = await (order === 'popular' ? searchPopularIllust(keyword, token) : searchIllust(keyword, token));

    let illusts = response.data.illusts;
    if (mode === 'safe' || mode === '1') {
        illusts = illusts.filter((item) => item.x_restrict === 0);
    } else if (mode === 'r18' || mode === '2') {
        illusts = illusts.filter((item) => item.x_restrict === 1);
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
                description: `<p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p>${images.join('')}`,
                link: `https://www.pixiv.net/artworks/${illust.id}`,
            };
        }),
        allowEmpty: true,
    };
}
