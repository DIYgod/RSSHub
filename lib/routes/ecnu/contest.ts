import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/acm/contest/:category?',
    categories: ['university'],
    example: '/ecnu/acm/contest/public',
    parameters: { category: 'category is optional, default is all, use `public` for public only contests' },
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
            source: ['acm.ecnu.edu.cn/contest/', 'acm.ecnu.edu.cn/'],
            target: '/acm/contest/',
        },
    ],
    name: 'ACM Online-Judge contests list',
    maintainers: ['a180285'],
    handler,
    url: 'acm.ecnu.edu.cn/contest/',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const publicOnly = category === 'public';
    const rootUrl = 'https://acm.ecnu.edu.cn';
    const currentUrl = `${rootUrl}/contest/`;

    const response = await got(currentUrl);

    const $ = load(response.data);
    const $trList = $('div > div > table > tbody > tr');
    const items = $trList
        .filter((_, el) => !publicOnly || $(el).find('i').attr('class').includes('green'))
        .map((_, el) => {
            const $tdList = $(el).find('td');
            const title = $tdList.eq(0).text();
            const startTime = $tdList.eq(1).text();
            const duration = $tdList.eq(2).text();
            const link = rootUrl + $tdList.find('a').eq(0).attr('href');
            return {
                title,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    title,
                    startTime,
                    duration,
                }),
                link,
            };
        })
        .toArray();

    return {
        title: `ECNU ACM ${publicOnly ? '公开' : ''}比赛`,
        link: currentUrl,
        item: items,
    };
}
