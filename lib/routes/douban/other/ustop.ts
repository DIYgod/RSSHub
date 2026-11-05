import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/movie/ustop',
    categories: ['social-media'],
    example: '/douban/movie/ustop',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '北美票房榜',
    maintainers: ['DIYgod'],
    handler,
};

async function handler() {
    const link = 'https://movie.douban.com/chart';
    const response = await ofetch(link);
    const $ = load(response);

    return {
        title: '豆瓣电影北美票房榜',
        link,
        item: $('#listCont1 > li')
            .toArray()
            .map((element) => {
                const item = $(element);
                const movie = item.find('.box_chart a');
                return {
                    title: movie.text(),
                    description: `票房：${item.find('.box_chart_num').text()} 美元`,
                    link: movie.attr('href'),
                };
            }),
    };
}
