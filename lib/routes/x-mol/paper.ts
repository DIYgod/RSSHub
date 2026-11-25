import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDateStrict } from '@/utils/time';

import utils from './utils';

async function fetchDetail(link: string): Promise<Pick<DataItem, 'description' | 'author' | 'doi'>> {
    const response = await got(link);
    const $ = load(response.data);
    const description = $('.maga-content');
    const doi = description.find('.itsmblue').eq(1).text().trim();
    description.find('.itgaryfirst').remove();
    description.find('span').eq(0).remove();
    const author = description.find('span').eq(0).text().trim();
    description.find('span').eq(0).remove();
    return { doi, author, description: description.html() };
}

export const route: Route = {
    path: '/paper/:type/:magazine',
    categories: ['journal'],
    example: '/x-mol/paper/0/9',
    parameters: { type: 'type', magazine: 'magazine' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Journal',
    maintainers: ['cssxsh'],
    handler,
};

async function handler(ctx) {
    const { type, magazine } = ctx.req.param();
    const path = `paper/${type}/${magazine}`;
    const link = new URL(path, utils.host).href;
    const response = await got(link, {
        headers: {
            Cookie: 'journalIndexViewType=grid',
        },
    });
    const data = response.data;
    const $ = load(data);

    const newsItem = $('.magazine-model-content-new li')
        .toArray()
        .slice(0, getRouteLimit(ctx, 20))
        .filter((item) => $(item).find('.magazine-model-btn a').attr('href'))
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const rawDate = $item
                .find('.magazine-text-atten')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/)?.[0];
            const pubDate = rawDate ? parseDateStrict(rawDate, 'YYYY-MM-DD', 8) : undefined;
            return {
                title: $item.find('.magazine-text-title a').text(),
                link: new URL($item.find('.magazine-model-btn a').attr('href')!, utils.host).href,
                pubDate,
            };
        });

    const item = await pMap(
        newsItem,
        async (element) => {
            const detail = await cache.tryGet(`xmol:paper:detail:v1:${element.link}`, () => fetchDetail(element.link));
            return { ...element, doi: detail.doi, author: detail.author, description: detail.description };
        },
        { concurrency: 2, stopOnError: false }
    );

    return {
        title: $('title').text(),
        link,
        description: $('meta[name="description"]').attr('content'),
        item,
    };
}
