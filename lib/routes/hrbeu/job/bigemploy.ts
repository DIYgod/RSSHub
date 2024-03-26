import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/job/bigemploy',
    categories: ['university'],
    example: '/hrbeu/job/bigemploy',
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
            source: ['job.hrbeu.edu.cn/*'],
        },
    ],
    name: '大型招聘会',
    maintainers: ['Derekmini'],
    handler,
    url: 'job.hrbeu.edu.cn/*',
};

async function handler() {
    const response = await got('http://job.hrbeu.edu.cn/HrbeuJY/web');

    const $ = load(response.data);

    const list = $('div.articlecontent')
        .map((_, item) => ({
            title: $(item).find('a.bigTitle').text(),
            pubDate: parseDate($(item).find('p').eq(1).text().replace('时间:', '').trim()),
            description: '点击标题，登录查看招聘详情',
            link: $(item).find('a.bigTitle').attr('href'),
        }))
        .get();

    return {
        title: '大型招聘会',
        link: 'http://job.hrbeu.edu.cn/HrbeuJY/web',
        item: list,
        allowEmpty: true,
    };
}
