// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import * as path from 'node:path';
import { art } from '@/utils/render';
import { fallback, queryToInteger } from '@/utils/readable-social';

export default async (ctx) => {
    const subjectType = ctx.req.param('type') || 'tv';
    const apiKey = '0ac44ae016490db2204ce0a042db2916';
    let url = `https://frodo.douban.com/api/v2/skynet/new_playlists?apikey=${apiKey}&subject_type=${subjectType}`;
    let response = await got({
        method: 'get',
        url,
        headers: {
            'User-Agent': 'MicroMessenger/',
            Referer: 'https://servicewechat.com/wx2f9b06c1de1ccfca/91/page-frame.html',
        },
    });

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const mon = month < 10 ? '0' + month : month.toString();

    let items = response.data.data[0].items;

    const subjectCollectionId = items.find((item) => item.title.startsWith(`${year}年${mon}月`)).id;

    const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param('routeParams')));
    const playable = fallback(undefined, queryToInteger(routeParams.playable), 0);
    const score = fallback(undefined, queryToInteger(routeParams.score), 0);

    url = `https://m.douban.com/rexxar/api/v2/subject_collection/${subjectCollectionId}/items?playable=${playable}`;
    response = await got({
        method: 'get',
        url,
        headers: {
            Referer: `https://m.douban.com/subject_collection/${subjectCollectionId}`,
        },
    });
    const description = response.data.subject_collection.description;
    items = response.data.subject_collection_items
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
    ctx.set('data', {
        title: `豆瓣 - ${response.data.subject_collection.name}`,
        link: `https://m.douban.com/subject_collection/${subjectCollectionId}`,
        item: items,
        description,
    });
};
