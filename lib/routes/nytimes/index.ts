// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import parser from '@/utils/rss-parser';
const utils = require('./utils');
import { load } from 'cheerio';
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    let { lang = '' } = ctx.req.param();
    lang = lang.toLowerCase();

    let title = '纽约时报中文网';
    let rssUrl = 'https://cn.nytimes.com/rss/';

    switch (lang) {
        case 'dual':
            title += ' - 中英对照版';

            break;

        case 'en':
            title += ' - 英文原版';

            break;

        case 'traditionalchinese':
            title = '紐約時報中文網';
            rssUrl = new URL('zh-hant', rssUrl).href;

            break;

        case 'dual-traditionalchinese':
            title = '紐約時報中文網 - 中英對照版';
            rssUrl = new URL('zh-hant', rssUrl).href;
            lang = 'dual';

            break;

        default:
        // Do nothing
    }

    const browser = await puppeteer();
    const feed = await parser.parseURL(rssUrl);
    const items = await Promise.all(
        feed.items.splice(0, 10).map(async (item) => {
            let link = item.link;

            let response,
                hasEnVersion = false,
                dual = false;

            if (lang === 'dual') {
                link = link.replace('/?utm_source=RSS', '') + '/dual';

                try {
                    response = await cache.tryGet(`nyt: ${link}`, async () => {
                        const response = await got(link);

                        return response.data;
                    });

                    dual = true;
                } catch {
                    response = await cache.tryGet(`nyt: ${item.link}`, async () => {
                        const response = await got(item.link);

                        return response.data;
                    });
                }
            } else {
                response = await cache.tryGet(`nyt: ${item.link}`, async () => {
                    const response = await got(item.link);

                    return response.data;
                });

                if (lang === 'en') {
                    const $ = load(response);
                    if ($('.dual-btn').length > 0) {
                        hasEnVersion = true;
                        link = $('.dual-btn a').last().attr().href;

                        response = await utils.PuppeterGetter(ctx, browser, link);
                    }
                }
            }

            const single = {
                title: item.title,
                pubDate: item.pubDate,
                link,
                author: item['dc:creator'],
            };

            const result = utils.ProcessFeed(response, hasEnVersion);

            // Match 感谢|謝.*?cn.letters@nytimes.com。
            const ending = /&#x611F;(&#x8C22|&#x8B1D);.*?cn\.letters@nytimes\.com&#x3002;/g;

            single.description = result.description?.replace(ending, '');

            if (hasEnVersion) {
                single.title = result.title;
                single.author = result.author;
            }

            if (dual) {
                single.title = `「中英」${single.title}`;
            }

            return single;
        })
    );

    browser.close();

    ctx.set('data', {
        title,
        link: 'https://cn.nytimes.com',
        description: title,
        item: items,
    });
};
