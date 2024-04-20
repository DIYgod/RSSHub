import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://www.hellobtc.com';

const channelSelector = {
    latest: 'div.index_tabs_container.js-tabs-container > div:nth-child(1)',
    application: 'div.index_tabs_container.js-tabs-container > div:nth-child(2)',
};

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
    const channel = ctx.req.param('channel') ?? 'latest';
    const url = rootUrl;

    const response = await got(url);
    const $ = load(response.data);
    const list = $(channelSelector[channel])
        .find('div.new_item')
        .map((_, item) => ({
            title: $(item).find('h2').text(),
            link: $(item).find('a').attr('href'),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('#nr').html();
                item.pubDate = timezone(parseDate(content('span.date').text(), 'YYYY-MM-DD HH:mm:ss'), +8);

                return item;
            })
        )
    );

    return {
        title: `白话区块链 - 首页 ${titleMap[channel]}`,
        link: url,
        item: items,
    };
}
