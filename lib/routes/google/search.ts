// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { config } from '@/config';

const renderDescription = (description, images) => art(path.join(__dirname, './templates/description.art'), { description, images });

export default async (ctx) => {
    const { keyword, language } = ctx.req.param();
    const searchParams = new URLSearchParams({
        q: keyword,
    });
    const tempUrl = new URL('https://www.google.com/search');
    tempUrl.search = searchParams.toString();
    const url = tempUrl.toString();
    const key = `google-search:${language}:${url}`;
    const items = await cache.tryGet(
        key,
        async () => {
            const response = (
                await got(url, {
                    headers: {
                        'Accept-Language': language,
                    },
                })
            ).data;
            const $ = load(response);
            const content = $('#rso');
            return content
                .find('> div')
                .map((i, el) => {
                    const element = $(el);
                    const link = element.find('div > div > div > div > div > span > a').first().attr('href');
                    const title = element.find('div > div > div> div > div > span > a > h3').first().text();
                    const imgs = element
                        .find('img')
                        .map((_j, _el) => $(_el).attr('src'))
                        .toArray();
                    const description = element.find('div[style="-webkit-line-clamp:2"]').first().text() || element.find('div[role="heading"]').first().text();
                    const author = element.find('div > div > div > div > div > span > a > div > div > span').first().text() || '';
                    return {
                        link,
                        title,
                        description: renderDescription(description, imgs),
                        author,
                    };
                })
                .toArray()
                .filter((e) => e?.link);
        },
        config.cache.routeExpire,
        false
    );

    ctx.set('data', {
        title: `${keyword} - Google Search`,
        description: `${keyword} - Google Search`,
        link: url,
        item: items,
    });
};
