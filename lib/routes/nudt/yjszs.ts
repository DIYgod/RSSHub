import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import timezone from '@/utils/timezone';

/* 研究生院 */
const host = 'http://yjszs.nudt.edu.cn';

// 目前研究生院最近仍在更新的链接
const yjszs = new Map([
    // http://yjszs.nudt.edu.cn/pubweb/homePageList/recruitStudents.view?keyId=2
    // http://yjszs.nudt.edu.cn//pubweb/homePageList/searchContent.view
    ['2', { title: '国防科技大学研究生院 - 通知公告' }],
    // http://yjszs.nudt.edu.cn/pubweb/homePageList/recruitStudents.view?keyId=1
    ['1', { title: '国防科技大学研究生院 - 首页' }],
    // http://yjszs.nudt.edu.cn/pubweb/homePageList/recruitStudents.view?keyId=8
    ['8', { title: '国防科技大学研究生院 - 招生简章' }],
    // http://yjszs.nudt.edu.cn/pubweb/homePageList/recruitStudents.view?keyId=12
    ['12', { title: '国防科技大学研究生院 - 学校政策' }],
    // http://yjszs.nudt.edu.cn//pubweb/homePageList/recruitStudents.view?keyId=16
    ['16', { title: '国防科技大学研究生院 - 硕士招生' }],
    // http://yjszs.nudt.edu.cn/pubweb/homePageList/recruitStudents.view?keyId=17
    ['17', { title: '国防科技大学研究生院 - 博士招生' }],
    // http://yjszs.nudt.edu.cn/pubweb/homePageList/recruitStudents.view?keyId=23
    ['23', { title: '国防科技大学研究生院 - 院所发文' }],
    // http://yjszs.nudt.edu.cn/pubweb/homePageList/recruitStudents.view?keyId=25
    ['25', { title: '国防科技大学研究生院 - 数据统计' }],
]);

export const route: Route = {
    path: '/yjszs/:keyId?',
    categories: ['university'],
    example: '/nudt/yjszs/2',
    parameters: { keyId: '分类，见下表，默认为通知公告' },
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
            source: ['yjszs.nudt.edu.cn'],
        },
    ],
    name: '研究生院',
    maintainers: ['Blank0120'],
    handler,
    url: 'yjszs.nudt.edu.cn/',
    description: `| 通知公告 | 首页 | 招生简章 | 学校政策 | 硕士招生 | 博士招生 | 院所发文 | 数据统计 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| 2     | 1     | 8     | 12     | 16     | 17     | 23     | 25     |`,
};

async function handler(ctx) {
    const keyId = ctx.req.param('keyId') ?? '2';
    const info = yjszs.get(keyId);
    if (!info) {
        throw new InvalidParameterError('invalid keyId');
    }
    let link = `${host}/pubweb/homePageList`;
    link += keyId === '2' ? `/searchContent.view` : `/recruitStudents.view?keyId=${keyId}`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = load(response.data);
    const content = $('.news-list li');
    const items = content.toArray().map((elem) => {
        elem = $(elem);
        return {
            link: new URL(elem.find('a').attr('href'), host).href,
            title: elem.find('h3').text().trim(),
            pubDate: timezone(parseDate(elem.find('.time').text(), 'YYYY-MM-DD'), -8),
        };
    });

    return {
        title: info.title,
        link,
        item: items,
    };
}
