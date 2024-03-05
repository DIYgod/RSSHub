// @ts-nocheck
import cache from '@/utils/cache';
const { getToken } = require('./token');
const getRanking = require('./api/get-ranking');
import { config } from '@/config';
const pixivUtils = require('./utils');
import { parseDate } from '@/utils/parse-date';

const titles = {
    day: 'pixiv 日排行',
    week: 'pixiv 周排行',
    month: 'pixiv 月排行',
    day_male: 'pixiv 受男性欢迎排行',
    day_female: 'pixiv 受女性欢迎排行',
    week_original: 'pixiv 原创作品排行',
    week_rookie: 'pixiv 新人排行',
    day_r18: 'pixiv R-18 日排行',
    day_r18_ai: 'pixiv R-18 AI生成作品排行',
    day_male_r18: 'pixiv R-18 受男性欢迎排行',
    day_female_r18: 'pixiv R-18 受女性欢迎排行',
    week_r18: 'pixiv R-18 周排行',
    week_r18g: 'pixiv R-18G 排行',
    day_ai: 'AI 生成作品排行榜',
};

const links = {
    day: 'https://www.pixiv.net/ranking.php?mode=daily',
    week: 'https://www.pixiv.net/ranking.php?mode=weekly',
    month: 'https://www.pixiv.net/ranking.php?mode=monthly',
    day_male: 'https://www.pixiv.net/ranking.php?mode=male',
    day_female: 'https://www.pixiv.net/ranking.php?mode=female',
    day_ai: 'https://www.pixiv.net/ranking.php?mode=daily_ai',
    week_original: 'https://www.pixiv.net/ranking.php?mode=original',
    week_rookie: 'https://www.pixiv.net/ranking.php?mode=rookie',
    day_r18: 'https://www.pixiv.net/ranking.php?mode=daily_r18',
    day_r18_ai: 'https://www.pixiv.net/ranking.php?mode=daily_r18_ai',
    day_male_r18: 'https://www.pixiv.net/ranking.php?mode=male_r18',
    day_female_r18: 'https://www.pixiv.net/ranking.php?mode=female_r18',
    week_r18: 'https://www.pixiv.net/ranking.php?mode=weekly_r18',
    week_r18g: 'https://www.pixiv.net/ranking.php?mode=r18g',
};

const alias = {
    daily: 'day',
    weekly: 'week',
    monthly: 'month',
    male: 'day_male',
    female: 'day_female',
    daily_ai: 'day_ai',
    original: 'week_original',
    rookie: 'week_rookie',
    daily_r18: 'day_r18',
    daily_r18_ai: 'day_r18_ai',
    male_r18: 'day_male_r18',
    female_r18: 'day_female_r18',
    weekly_r18: 'week_r18',
    r18g: 'week_r18g',
};

export default async (ctx) => {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new Error('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const mode = alias[ctx.req.param('mode')] ?? ctx.req.param('mode');
    const date = ctx.req.param('date') ? new Date(ctx.req.param('date')) : new Date();

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new Error('pixiv not login');
    }

    const response = await getRanking(mode, ctx.req.param('date') && date, token);

    const illusts = response.data.illusts;

    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 `;

    ctx.set('data', {
        title: (ctx.req.param('date') ? dateStr : '') + titles[mode],
        link: links[mode],
        description: dateStr + titles[mode],
        item: illusts.map((illust, index) => {
            const images = pixivUtils.getImgs(illust);
            return {
                title: `#${index + 1} ${illust.title}`,
                pubDate: parseDate(illust.create_date),
                description: `<p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p><br>${images.join('')}`,
                link: `https://www.pixiv.net/artworks/${illust.id}`,
                author: illust.user.name,
                category: illust.tags.map((tag) => tag.name),
            };
        }),
    });
};
