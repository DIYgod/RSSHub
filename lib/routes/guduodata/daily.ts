import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import dayjs from 'dayjs';
import { art } from '@/utils/render';
import path from 'node:path';

const host = 'http://d.guduodata.com';

const types = {
    collect: {
        name: '汇总榜',
        categories: {
            drama: '连续剧',
            variety: '综艺',
        },
    },
    bill: {
        name: '排行榜',
        categories: {
            network_drama: '网络剧',
            network_movie: '网络大电影',
            network_variety: '网络综艺',
            tv_drama: '电视剧',
            tv_variety: '电视综艺',
            anime: '国漫',
        },
    },
};

export const route: Route = {
    path: '/daily',
    categories: ['other'],
    example: '/guduodata/daily',
    parameters: {},
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
            source: ['guduodata.com/'],
        },
    ],
    name: '日榜',
    maintainers: ['Gem1ni'],
    handler,
    url: 'guduodata.com/',
};

async function handler() {
    const now = dayjs().valueOf();
    // yestoday
    const yestoday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    const renderRows = (rows) => art(path.join(__dirname, './templates/daily.art'), { rows });
    const items = Object.keys(types).flatMap((key) =>
        Object.keys(types[key].categories).map((category) => ({
            type: key,
            name: `[${yestoday}] ${types[key].name} - ${types[key].categories[category]}`,
            category: category.toUpperCase(),
            url: `${host}/m/v3/billboard/list?type=DAILY&category=${category.toUpperCase()}&date=${yestoday}`,
        }))
    );
    return {
        title: `骨朵数据 - 日榜`,
        link: host,
        description: yestoday,
        item: await Promise.all(
            items.map((item) =>
                cache.tryGet(item.url, async () => {
                    const response = await got.get(`${item.url}&t=${now}`, {
                        headers: { Referer: `http://guduodata.com/` },
                    });
                    const data = response.data.data;
                    return {
                        title: item.name,
                        pubDate: yestoday,
                        link: item.url,
                        description: renderRows(data),
                    };
                })
            )
        ),
    };
}
