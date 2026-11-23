import { load } from 'cheerio';

import type { Route } from '@/types';

import { createJslFetch } from './jsl';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/ichunqiu',
    features: {
        antiCrawler: true,
    },
    name: '资讯',
    maintainers: ['8430177'],
    handler,
};

async function handler() {
    const baseSite = 'https://bbs.ichunqiu.com/';
    const link = `${baseSite}portal.php`;

    const body = await createJslFetch()(link);

    const $ = load(body);

    return {
        title: 'i春秋学院 ~ 资讯',
        link: baseSite,
        description: 'i春秋学院 ~ 资讯',
        item: $('.module dl')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('dt a[title]');
                const title = a.attr('title');
                if (!title) {
                    return;
                }
                return {
                    title,
                    link: new URL(a.attr('href')!, baseSite).href,
                    description: $item.find('dd:not(.m)').text().trim(),
                };
            })
            .filter((item) => item !== undefined),
    };
}
