import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
import { config } from '@/config';

const renderDescription = (description, images) => art(path.join(__dirname, './templates/description.art'), { description, images });

export const route: Route = {
    path: '/search/:keyword/:language?',
    categories: ['other'],
    example: '/google/search/rss/zh-CN,zh',
    parameters: { keyword: 'Keyword', language: 'Accept-Language. Example: zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Search',
    maintainers: ['CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
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
                .toArray()
                .map((el) => {
                    const element = $(el);
                    const link = element.find('div > div > div > div > div > span > a').first().attr('href');
                    const title = element.find('div > div > div> div > div > span > a > h3').first().text();
                    const imgs = element
                        .find('img')
                        .toArray()
                        .map((_el) => $(_el).attr('src'));
                    const description = element.find('div[style="-webkit-line-clamp:2"]').first().text() || element.find('div[role="heading"]').first().text();
                    const author = element.find('div > div > div > div > div > span > a > div > div > span').first().text() || '';
                    return {
                        link,
                        title,
                        description: renderDescription(description, imgs),
                        author,
                    };
                })
                .filter((e) => e?.link);
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `${keyword} - Google Search`,
        description: `${keyword} - Google Search`,
        link: url,
        item: items,
    };
}
