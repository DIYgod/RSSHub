import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const homeUrl = 'https://www.bio.pku.edu.cn/homes/Index/news_jz/7/7.html';

export const route: Route = {
    path: '/cls/lecture',
    categories: ['university'],
    example: '/pku/cls/lecture',
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
            source: ['www.bio.pku.edu.cn/homes/Index/news_jz/7/7.html', 'www.bio.pku.edu.cn/'],
        },
    ],
    name: '生命科学学院近期讲座',
    maintainers: ['TPOB'],
    handler,
    url: 'www.bio.pku.edu.cn/homes/Index/news_jz/7/7.html',
};

async function handler() {
    const response = await got(homeUrl);

    const $ = load(response.data);
    return {
        title: '北京大学生命科学学院近期讲座',
        link: homeUrl,
        description: '北京大学生命科学学院近期讲座',
        item: $('a.clearfix')
            .toArray()
            .map((item) => ({
                title: $(item).find('p').text(),
                description: $(item)
                    .find('.chair_txt span')
                    .toArray()
                    .map((elem) => $.html(elem))
                    .join(''),
                pubDate: $(item).find('.date').text() ? parseDate(`${$(item).find('.date').text().replaceAll('.', '-')}T00:00:00Z`) : undefined,
                link: new URL($(item).attr('href')!, homeUrl).href,
            })),
    };
}
