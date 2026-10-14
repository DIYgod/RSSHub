import { load } from 'cheerio';
import pMap from 'p-map';

import { config } from '@/config';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { parseDate } from '@/utils/parse-date';
import playwright from '@/utils/playwright';
import timezone from '@/utils/timezone';

import { host, playwrightGet } from './utils';

export const route: Route = {
    path: '/list/:gchannel?',
    categories: ['government'],
    example: '/gov/customs/list/paimai',
    parameters: { gchannel: '支持 `paimai`, `fagui` 及 `latest` 3 个频道，默认为 `paimai`' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.customs.gov.cn/'],
            target: '/list',
        },
    ],
    name: '拍卖信息 / 海关法规 / 最新文件',
    maintainers: ['Jeason0228', 'TonyRL', 'he1q'],
    handler,
    url: 'www.customs.gov.cn/',
    description: `::: warning
由于区域限制，建议在国内 IP 的机器上自建
:::`,
};

function getPublicationDate(value: string | undefined) {
    const date = value ? parseDate(value) : undefined;
    return date && !Number.isNaN(date.getTime()) ? timezone(date, 8) : undefined;
}

async function handler(ctx) {
    const { gchannel = 'paimai' } = ctx.req.param();
    let channelName: string;
    let link = '';

    switch (gchannel) {
        case 'paimai':
            channelName = '拍卖信息';
            link = `${host}/customs/302249/zfxxgk/fdzdgknr/2799883/index.html`;
            break;
        case 'fagui':
            channelName = '海关法规';
            link = `${host}/customs/302249/302266/index.html`;
            break;
        case 'latest':
            channelName = '最新文件';
            link = `${host}/customs/302249/2480148/index.html`;
            break;
        default:
            throw new InvalidParameterError('Invalid channel. Use paimai, fagui or latest.');
    }

    const context = await playwright();

    try {
        const list = await cache.tryGet(
            link,
            async () => {
                const response = await playwrightGet(link, context);
                const $ = load(response);
                const list = $('.news_list li, [class^="conList_ul"] li')
                    .toArray()
                    .map((item) => {
                        const $item = $(item);
                        return {
                            title: $item.find('a').attr('title') || $item.find('a').text(),
                            link: new URL($item.find('a').attr('href')!, host).href,
                            date: getPublicationDate($item.find('span').text()),
                        };
                    });
                return list;
            },
            config.cache.routeExpire,
            false
        );

        const out = await pMap(
            list,
            (info) =>
                cache.tryGet(info.link, async () => {
                    if (info.link.endsWith('.pdf') || info.link.endsWith('.doc')) {
                        return { title: info.title, link: info.link, pubDate: info.date };
                    }
                    const response = await playwrightGet(info.link, context);
                    const $ = load(response);
                    $('.easysite-news-operation').remove();
                    const dateText = $('.news_detail_tit, .easysite-news-describe')
                        .text()
                        .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?/)?.[0];
                    const date = getPublicationDate(dateText ?? $('meta[name="PubDate"]').attr('content'));
                    const description = $('.news_detail_con, .easysite-news-peruse').first().html();

                    return {
                        title: info.title!,
                        link: info.link,
                        description,
                        author: $('meta[name="ContentSource"]').attr('content') || undefined,
                        pubDate: date || info.date,
                    };
                }),
            { concurrency: 3 }
        );

        return {
            title: `中国海关-${channelName}`,
            link,
            language: 'zh-CN' as const,
            item: out,
        };
    } finally {
        await context.close();
    }
}
