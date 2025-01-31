import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

const rootUrl = 'https://jobs.douban.com';

const titleMap = {
    social: '社会招聘',
    campus: '校园招聘',
    intern: '实习生招聘',
};

export const route: Route = {
    path: '/jobs/:type',
    categories: ['social-media'],
    example: '/douban/jobs/campus',
    parameters: { type: '招聘类型，见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '豆瓣招聘',
    maintainers: ['Fatpandac'],
    handler,
    description: `| 社会招聘 | 校园招聘 | 实习生招聘 |
| :------: | :------: | :--------: |
|  social  |  campus  |   intern   |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const url = `${rootUrl}/jobs/${type}`;

    const response = await got.get(url);
    const $ = load(response.data);
    const list = $('div.mod.position');

    const items = list
        .map((_, item) => ({
            title: $(item).find('h3').text(),
            link: `${url}#${$(item).find('h3').attr('id')}`,
            description: $(item).find('div.bd').html(),
        }))
        .get();

    return {
        title: `豆瓣${titleMap[type]}`,
        link: url,
        item: items,
    };
}
