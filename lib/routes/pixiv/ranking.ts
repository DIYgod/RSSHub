import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import { getToken } from './token';
import getRanking from './api/get-ranking';
import { config } from '@/config';
import pixivUtils from './utils';
import { parseDate } from '@/utils/parse-date';
import ConfigNotFoundError from '@/errors/types/config-not-found';

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

export const route: Route = {
    path: '/ranking/:mode/:date?',
    categories: ['social-media', 'popular'],
    view: ViewType.Pictures,
    example: '/pixiv/ranking/week',
    parameters: {
        mode: {
            description: 'rank type',
            options: [
                {
                    value: 'day',
                    label: 'daily rank',
                },
                {
                    value: 'week',
                    label: 'weekly rank',
                },
                {
                    value: 'month',
                    label: 'monthly rank',
                },
                {
                    value: 'day_male',
                    label: 'male rank',
                },
                {
                    value: 'day_felame',
                    label: 'female rank',
                },
                {
                    value: 'day_ai',
                    label: 'AI-generated work Rankings',
                },
                {
                    value: 'week_original',
                    label: 'original rank',
                },
                {
                    value: 'week_rookie',
                    label: 'rookie user rank',
                },
                {
                    value: 'day_r18',
                    label: 'R-18 daily rank',
                },
                {
                    value: 'day_r18_ai',
                    label: 'R-18 AI-generated work',
                },
                {
                    value: 'day_male_r18',
                    label: 'R-18 male rank',
                },
                {
                    value: 'day_female_r18',
                    label: 'R-18 female rank',
                },
                {
                    value: 'week_r18',
                    label: 'R-18 weekly rank',
                },
                {
                    value: 'week_r18g',
                    label: 'R-18G rank',
                },
            ],
            default: 'day',
        },
        date: 'format: `2018-4-25`',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Rankings',
    maintainers: ['EYHN'],
    handler,
};

async function handler(ctx) {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new ConfigNotFoundError('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const mode = alias[ctx.req.param('mode')] ?? ctx.req.param('mode');
    const date = ctx.req.param('date') ? new Date(ctx.req.param('date')) : new Date();

    const token = await getToken(cache.tryGet);
    if (!token) {
        throw new ConfigNotFoundError('pixiv not login');
    }

    const response = await getRanking(mode, ctx.req.param('date') && date, token);

    const illusts = response.data.illusts;

    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 `;

    return {
        title: (ctx.req.param('date') ? dateStr : '') + titles[mode],
        link: links[mode],
        description: dateStr + titles[mode],
        item: illusts.map((illust, index) => {
            const images = pixivUtils.getImgs(illust);
            return {
                title: `#${index + 1} ${illust.title}`,
                pubDate: parseDate(illust.create_date),
                description: `${illust.caption}<br><p>画师：${illust.user.name} - 阅览数：${illust.total_view} - 收藏数：${illust.total_bookmarks}</p><br>${images.join('')}`,
                link: `https://www.pixiv.net/artworks/${illust.id}`,
                author: [
                    {
                        name: illust.user.name,
                        url: `https://www.pixiv.net/users/${illust.user.id}`,
                        avatar: illust.user.profile_image_urls.medium,
                    },
                ],
                category: illust.tags.map((tag) => tag.name),
            };
        }),
    };
}
