import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/movie/weekly/:type?',
    categories: ['social-media'],
    example: '/douban/movie/weekly',
    parameters: { type: '分类，可在榜单页 URL 中找到，默认为一周口碑电影榜' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '一周口碑榜',
    maintainers: ['numm233', 'nczitzk'],
    handler,
    description: `| 一周口碑电影榜      | 华语口碑剧集榜            |
| ------------------- | ------------------------- |
| movie\_weekly\_best | tv\_chinese\_best\_weekly |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'movie_weekly_best';

    const link = 'https://m.douban.com/movie';
    const apiUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${type}`;

    const itemResponse = await got({
        method: 'get',
        url: `${apiUrl}/items?start=0&count=10`,
        headers: {
            Referer: link,
        },
    });
    const infoResponse = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Referer: link,
        },
    });

    const data = itemResponse.data.subject_collection_items;

    return {
        title: infoResponse.data.title,
        link: `https://m.douban.com/subject_collection/${type}`,
        description: infoResponse.data.description,

        item: data.map(({ title, cover, cover_url, url, rating, null_rating_reason, description, card_subtitle, photos }) => {
            const rate = rating ? `${rating.value.toFixed(1)}分` : null_rating_reason;
            if (cover && cover.url) {
                cover_url = cover.url;
            }

            return {
                title,
                description: art(path.join(__dirname, '../templates/weekly_best.art'), {
                    title,
                    card_subtitle,
                    description,
                    rate,
                    cover_url,
                    photos,
                }),
                link: url,
            };
        }),
    };
}
