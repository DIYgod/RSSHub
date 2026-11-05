import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import CaptchaError from '@/errors/types/captcha';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getHeaders } from './utils';

const units = {
    1: '今日热门',
    7: '周热门',
    30: '月热门',
};

export const route: Route = {
    path: '/haowen/:day?',
    categories: ['shopping'],
    example: '/smzdm/haowen/1',
    parameters: {
        day: {
            description: '以天为时间跨度，默认为 `1`',
            options: Object.entries(units).map(([value, label]) => ({ value, label })),
            default: '1',
        },
    },
    features: {
        requireConfig: [
            {
                name: 'SMZDM_COOKIE',
                optional: true,
                description: '什么值得买登录后的 Cookie 值',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '好文',
    maintainers: ['LogicJake', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const day = ctx.req.param('day') ?? '1';
    const link = `https://post.smzdm.com/hot_${day}/`;

    const response = await ofetch.raw('https://post.smzdm.com/rank/json_more/', {
        query: { unit: day },
        headers: {
            accept: 'application/json, text/javascript, */*; q=0.01',
            ...getHeaders(),
        },
    });
    const cookie = getHeaders().cookie || [...response.headers.getSetCookie().map((c) => c.split(';', 1)[0]), `x-waf-captcha-referer=${link}`].join('; ');

    const list: DataItem[] = response._data.data.map((item) => ({
        title: item.title,
        link: item.article_url,
        description: item.content,
        author: item.nickname,
        image: item.pic_url,
        category: item.channel_name,
        pubDate: timezone(parseDate(item.publish_time), 8),
    }));

    const out = await pMap(
        list,
        async (item) => {
            try {
                const detail = await cache.tryGet(item.link ?? '', async () => {
                    const response = await ofetch(item.link ?? '', {
                        headers: {
                            cookie,
                        },
                    });
                    const $ = load(response);
                    if ($('script[src*="captcha.qq.com/TCaptcha.js"]').length) {
                        throw new CaptchaError(`The article at ${item.link} requires a CAPTCHA.`);
                    }
                    const content = $('#articleId');
                    content.find('.item-name').remove();
                    content.find('.recommend-tab').remove();

                    const releaseDate = $('meta[property="og:release_date"]').attr('content');

                    const description = content.html() ?? undefined;
                    const pubDate = releaseDate ? timezone(parseDate(releaseDate), 8) : undefined;
                    const author = $('meta[property="og:author"]').attr('content');

                    return { description, pubDate, author };
                });
                return { ...item, description: detail.description ?? item.description, pubDate: detail.pubDate ?? item.pubDate, author: detail.author ?? item.author };
            } catch (error) {
                if (!(error instanceof FetchError || error instanceof CaptchaError)) {
                    throw error;
                }
                return item;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: `${units[day]}-什么值得买好文`,
        link,
        item: out,
    };
}
