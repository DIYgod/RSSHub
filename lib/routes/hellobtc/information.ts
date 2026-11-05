import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';

const rootUrl = 'https://www.hellobtc.com';

const channelSelector = {
    latest: 'div.index_tabs_container.js-tabs-container > div:nth-child(1)',
    application: 'div.index_tabs_container.js-tabs-container > div:nth-child(2)',
};

const channelAliases = { 最新: 'latest', 应用: 'application' };

const titleMap = {
    latest: '最新',
    application: '应用',
};

export const route: Route = {
    path: '/information/:channel?',
    categories: ['new-media'],
    example: '/hellobtc/information/latest',
    parameters: { channel: '类型，可填 `latest` 和 `application` 及最新和应用，默认为最新' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '首页',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler(ctx) {
    const parameter = ctx.req.param('channel') ?? 'latest';
    const channel = Object.hasOwn(channelAliases, parameter) ? channelAliases[parameter] : parameter;
    if (!Object.hasOwn(channelSelector, channel)) {
        throw new InvalidParameterError(`Invalid channel: ${parameter}. Supported channels: ${Object.keys(channelSelector).join(', ')}.`);
    }
    const url = rootUrl;

    const response = await got(url);
    const $ = load(response.data);
    const list = $(channelSelector[channel])
        .find('div.new_item')
        .toArray()
        .map((item): DataItem => ({
            title: $(item).find('h2').text(),
            link: $(item).find('a').attr('href'),
        }));

    const items = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                const article = content('#nr, #ctx .article > article').first();
                article.find('.wants').remove();
                item.description = article.html();
                const date = content('.author span.date').first().text();
                item.pubDate = date ? parseDateInTimezone(date, 8) : undefined;

                return item;
            }),
        { concurrency: 3 }
    );

    return {
        title: `白话区块链 - 首页 ${titleMap[channel]}`,
        link: url,
        item: items,
    };
}
