import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/music/latest/:area?',
    categories: ['social-media'],
    example: '/douban/music/latest/chinese',
    parameters: { area: '区域类型，默认全部' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新增加的音乐',
    maintainers: ['fengkx', 'xyqfer'],
    handler,
    description: `| 华语    | 欧美    | 日韩        |
| ------- | ------- | ----------- |
| chinese | western | japankorean |`,
};

async function handler(ctx) {
    const { area = '' } = ctx.req.param();
    const title = '豆瓣最新增加的音乐';
    let data;

    if (area === '') {
        const url = 'https://music.douban.com/latest';
        const res = await got.get(url);
        const $ = load(res.data);
        const list = $('.dlist').toArray();

        data = {
            title,
            link: url,
            item: list.map((item) => ({
                title: $(item).find('.pl2').text(),
                link: $(item).find('.pl2').attr('href'),
                description: $(item).html(),
            })),
        };
    } else {
        const referer = 'https://m.douban.com/music/';
        const mapper = {
            chinese: {
                name: '华语新碟榜',
                path: 'chinese',
            },

            western: {
                name: '欧美新碟榜',
                path: 'occident',
            },

            japankorean: {
                name: '日韩新碟榜',
                path: 'japan_korea',
            },
        };
        const res = await got({
            method: 'get',
            url: `https://m.douban.com/rexxar/api/v2/subject_collection/music_${mapper[area].path}/items?os=ios&callback=&start=0&count=20&loc_id=0&_=0`,
            headers: {
                Referer: referer,
            },
        });

        data = {
            title: `${title}-${mapper[area].name}`,
            link: `${referer}new${area}`,
            item: res.data.subject_collection_items.map((item) => {
                const title = `${item.title}-${item.info}`;
                const link = `https://music.douban.com/subject/${item.id}/`;
                const rating = item.rating ? `<strong>评分:</strong> ${item.rating.value.toFixed(1)}` : item.null_rating_reason || '';
                const description = `
                    <img src="${item.cover.url}" /><br>
                    ${item.recommend_comment || item.description || ''}<br>
                    ${rating}
                `;
                const date = item.pubdate?.find((date: string) => /^\d{4}-\d{1,2}-\d{1,2}$/.test(date));
                const parsedDate = date ? timezone(parseDate(date, ['YYYY-MM-DD', 'YYYY-M-D', 'YYYY-MM-D', 'YYYY-M-DD'], true), 0) : undefined;
                const pubDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined;

                return {
                    title,
                    link,
                    description,
                    pubDate,
                };
            }),
        };
    }

    return data;
}
