import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { load } from 'cheerio';

const host = 'https://www.ymgal.games';

const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;

export const route: Route = {
    path: '/game/release',
    categories: ['anime'],
    example: '/ymgal/game/release',
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
            source: ['ymgal.games/'],
        },
    ],
    name: '本月新作',
    maintainers: ['SunBK201'],
    handler,
    url: 'ymgal.games/',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: `${host}/release-list/${year}/${month}`,
    });

    const $ = load(response.data);
    const list = $('.game-view-card').toArray();

    const items =
        list &&
        list.map((item) => {
            item = $(item);
            const itemPicUrl = item.find('.lazy').first().attr('data-original');
            const tags = item.find('.tag-info-list').children();
            const taginfo = tags.map((i, elem) => $(elem).text()).get();
            return {
                title: item.attr('title'),
                link: `${host}${item.attr('href')}`,
                description: art(path.join(__dirname, 'templates/description.art'), { itemPicUrl, taginfo }),
            };
        });

    return {
        title: `月幕 Galgame - 本月新作`,
        link: `${host}/release-list/${year}/${month}`,
        description: '月幕 Galgame - 本月新作',
        item: items,
    };
}
