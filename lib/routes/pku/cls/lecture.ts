import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const homeUrl = 'http://bio.pku.edu.cn/homes/Index/news_jz/7/7.html';
const baseUrl = 'http://bio.pku.edu.cn';

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
            source: ['bio.pku.edu.cn/homes/Index/news_jz/7/7.html', 'bio.pku.edu.cn/'],
        },
    ],
    name: '生命科学学院近期讲座',
    maintainers: ['TPOB'],
    handler,
    url: 'bio.pku.edu.cn/homes/Index/news_jz/7/7.html',
};

async function handler() {
    const response = await got(homeUrl);

    const $ = load(response.data);
    return {
        title: `北京大学生命科学学院近期讲座`,
        link: homeUrl,
        description: `北京大学生命科学学院近期讲座`,
        item: $('a.clearfix')
            .map((index, item) => ({
                title: $(item).find('p').text().trim(),
                description: '日期: ' + $(item).find('span'), // ${item.find('.chair_txt div').find('span').second().text()}
                pubDate: parseDate($(item).find('.date').text()),
                link: baseUrl + $('a.clearfix').attr('href'),
            }))
            .get(),
    };
}
