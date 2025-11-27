import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/mesalab/kb',
    categories: ['university'],
    example: '/cas/mesalab/kb',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.mesalab.cn/f/article/articleList', 'www.mesalab.cn/'],
        },
    ],
    name: '信息工程研究所 第二研究室 处理架构组 知识库',
    maintainers: ['renzhexigua'],
    handler,
    url: 'www.mesalab.cn/f/article/articleList',
};

async function handler() {
    const homepage = 'https://www.mesalab.cn';
    const url = `${homepage}/f/article/articleList?pageNo=1&pageSize=15&createTimeSort=DESC`;
    const response = await got(url);

    const $ = cheerio.load(response.data);
    const articles = $('.aw-item').toArray();

    const items = await Promise.all(
        articles.map((item) => {
            const a = $(item).find('a').first();
            const title = a.text().trim();
            const link = `${homepage}${a.attr('href')}`;

            return cache.tryGet(link, async () => {
                const result = await got(link);
                const $ = cheerio.load(result.data);
                return {
                    title,
                    author: $('.user_name').text(),
                    pubDate: timezone(parseDate($('.link_postdate').text().replaceAll(/\s+/g, ' ')), 8),
                    description: $('#article_content').html() + ($('.attachment').length ? $('.attachment').html() : ''),
                    link,
                    category: $('.category .category_r span').first().text(),
                };
            });
        })
    );

    return {
        title: 'MESA 知识库',
        description: '中国科学院信息工程研究所 第二研究室 处理架构组',
        link: url,
        item: items,
    };
}
