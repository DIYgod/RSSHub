import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';
const renderDescription = (description, images) => art(path.join(__dirname, './templates/description.art'), { description, images });
import { config } from '@/config';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['other'],
    example: '/baidu/search/rss',
    parameters: { keyword: '搜索关键词' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '搜索',
    maintainers: ['CaoMeiYouRen'],
    handler,
};

async function handler(ctx) {
    const keyword = ctx.req.param('keyword');
    const url = `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`;
    const key = `baidu-search:${url}`;

    const items = await cache.tryGet(
        key,
        async () => {
            const response = (await got(url)).data;
            const visitedLinks = new Set();
            const $ = load(response);
            const contentLeft = $('#content_left');
            const containers = contentLeft.find('.c-container');
            return containers
                .toArray()
                .map((el) => {
                    const element = $(el);
                    const link = element.find('h3 a').first().attr('href');
                    if (link && !visitedLinks.has(link)) {
                        visitedLinks.add(link);
                        const imgs = element
                            .find('img')
                            .toArray()
                            .map((_el) => $(_el).attr('src'));
                        const description = element.find('.c-gap-top-small [class^="content-right_"]').first().text() || element.find('.c-row').first().text() || element.find('.cos-row').first().text();
                        return {
                            title: element.find('h3').first().text(),
                            description: renderDescription(description, imgs),
                            link: element.find('h3 a').first().attr('href'),
                            author: element.find('.c-row .c-color-gray').first().text() || '',
                        };
                    }
                    return null;
                })
                .filter((e) => e?.link);
        },
        config.cache.routeExpire,
        false
    );

    return {
        title: `${keyword} - 百度搜索`,
        description: `${keyword} - 百度搜索`,
        link: url,
        item: items,
    };
}
