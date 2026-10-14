import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import CaptchaError from '@/errors/types/captcha';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/radio/academic',
    categories: ['university'],
    example: '/seu/radio/academic',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['radio.seu.edu.cn/_s29/15986/list.psp', 'radio.seu.edu.cn/'],
        },
    ],
    name: '信息科学与工程学院学术活动',
    maintainers: ['HenryQW'],
    handler,
    url: 'radio.seu.edu.cn/_s29/15986/list.psp',
};

async function handler() {
    const host = 'https://radio.seu.edu.cn';
    const link = new URL('_s29/15986/list.psp', host).href;
    const response = await got(link);

    const $ = load(response.data);

    const list = $('.list_item')
        .toArray()
        .map((e): DataItem => {
            const $e = $(e);
            const a = $e.find('.Article_Title a');
            return {
                title: a.attr('title')!,
                link: new URL(a.attr('href')!, host).href,
                pubDate: $e.find('.Article_PublishDate').text() ? parseDate(`${$e.find('.Article_PublishDate').text()}T00:00:00+08:00`) : undefined,
            };
        });

    const out = await pMap(
        list,
        async (item) => {
            const external = new URL(item.link!).hostname === 'mp.weixin.qq.com';
            try {
                const detail = await cache.tryGet(item.link!, async () => {
                    const response = await ofetch.raw(item.link!, { responseType: 'text' });
                    const html = response._data;
                    if (html === undefined) {
                        throw new Error(`No article response body was returned for ${item.link}.`);
                    }
                    const $ = load(html);
                    const content = external ? $('#js_content') : $('.wp_articlecontent');
                    if (external) {
                        if (new URL(response.url).pathname === '/mp/wappoc_appmsgcaptcha' || (!content.length && $('script[src="https://captcha.gtimg.com/TCaptcha.js"]').length)) {
                            throw new CaptchaError(`WeChat requires captcha verification for ${item.link}. Retry later or open the original article.`);
                        }
                        content.find('img[data-src]').each((_, image) => {
                            $(image).attr('src', $(image).attr('data-src')).removeAttr('data-src');
                        });
                    }
                    const timestamp = external ? /\bcreate_timestamp:\s*['"](\d+)['"]\s*\*\s*1/.exec(html)?.[1] : undefined;
                    return {
                        author: $('.arti_publisher').text().replace('发布者：', ''),
                        description: content.html(),
                        ...(timestamp && { pubDate: parseDate(Number(timestamp) * 1000) }),
                    };
                });
                return { ...item, ...detail };
            } catch (error) {
                if (external && (error instanceof FetchError || error instanceof CaptchaError)) {
                    return item;
                }
                throw error;
            }
        },
        { concurrency: 3 }
    );

    return {
        title: '东南大学信息科学与工程学院 -- 学术活动',
        link,
        item: out,
    };
}
