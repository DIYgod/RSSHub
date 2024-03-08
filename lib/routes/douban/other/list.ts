import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import * as path from 'node:path';
import { art } from '@/utils/render';
import { fallback, queryToInteger } from '@/utils/readable-social';

export const route: Route = {
    path: '/list/:type?/:routeParams?',
    categories: ['new-media'],
    example: '/douban/list/subject_real_time_hotest',
    parameters: { type: '榜单类型，见下表。默认为实时热门书影音', routeParams: '额外参数；请参阅以下说明和表格' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['www.douban.com/subject_collection/:type'],
        target: '/list/:type',
    },
    name: '豆瓣榜单与集合',
    maintainers: ['5upernova-heng', 'honue'],
    handler,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 'subject_real_time_hotest';
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param('routeParams')));
    const playable = fallback(undefined, queryToInteger(routeParams.playable), 0);
    const score = fallback(undefined, queryToInteger(routeParams.score), 0);
    let start = 0;
    const count = 50;
    let items = [];
    let title = '';
    let description = '';
    let total = null;
    while (total === null || start < total) {
        const url = `https://m.douban.com/rexxar/api/v2/subject_collection/${type}/items?playable=${playable}&start=${start}&count=${count}`;
        // eslint-disable-next-line no-await-in-loop
        const response = await got({
            method: 'get',
            url,
            headers: {
                Referer: `https://m.douban.com/subject_collection/${type}`,
            },
        });
        title = response.data.subject_collection.name;
        description = response.data.subject_collection.description;
        total = response.data.total;
        const newItems = response.data.subject_collection_items
            .filter((item) => {
                const rate = item.rating ? item.rating.value : 0;
                return rate >= score; // 保留rate大于等于score的项and过滤无评分项
            })
            .map((item) => {
                const title = item.title;
                const link = item.url;
                const description = art(path.join(__dirname, '../templates/list_description.art'), {
                    ranking_value: item.ranking_value,
                    title,
                    original_title: item.original_title,
                    rate: item.rating ? item.rating.value : null,
                    card_subtitle: item.card_subtitle,
                    description: item.cards ? item.cards[0].content : item.abstract,
                    cover: item.cover_url || item.cover?.url,
                });
                return {
                    title,
                    link,
                    description,
                };
            });
        items = [...items, ...newItems];
        start += count;
    }

    return {
        title: `豆瓣 - ${title}`,
        link: `https://m.douban.com/subject_collection/${type}`,
        item: items,
        description,
    };
}
