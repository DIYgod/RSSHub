import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
    const requestedLimit = Number(ctx.req.query('limit') ?? '20');
    const limit = Number.isFinite(requestedLimit) && requestedLimit >= 1 ? Math.floor(requestedLimit) : 20;

    const newsItem = $('.magazine-model-content-new li')
        .toArray()
        .slice(0, limit)
        .filter((item) => $(item).find('.magazine-model-btn a').first().attr('href'))
        .map((item): DataItem & { link: string } => {
            const $item = $(item);
            const rawDate = $item
                .find('.magazine-text-atten')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/)?.[0];
            const pubDate = rawDate ? timezone(parseDate(rawDate, 'YYYY-MM-DD', true), 8) : undefined;
            return {
                title: $item.find('.magazine-text-title a').text(),
                link: new URL($item.find('.magazine-model-btn a').first().attr('href')!, utils.host).href,
                pubDate: pubDate && Number.isFinite(pubDate.getTime()) ? pubDate : undefined,
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
