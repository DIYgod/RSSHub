import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import timezone from '@/utils/timezone';

/* 研究生院*/
const host = 'http://yjszs.nudt.edu.cn';

const yjszs = new Map([
    // http://yjszs.nudt.edu.cn//pubweb/homePageList/searchContent.view
    ['tzgg', { title: '国防科技大学研究生院 - 通知公告', view: 'searchContent' }],
    // http://yjszs.nudt.edu.cn//pubweb/homePageList/recruitStudents.view?keyId=16
    ['sszs', { title: '国防科技大学研究生院 - 硕士招生', view: 'recruitStudents', keyId: '16' }],
]);

export const route: Route = {
    path: '/yjszs/:type?',
    categories: ['university'],
    example: '/nudt/yjszs/sszs',
    parameters: { type: '分类，见下表，默认为硕士招生' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '研究生院',
    maintainers: ['Blank0120'],
    handler,
    url: 'yjszs.nudt.edu.cn/',
    description: `| 通知公告 | 硕士招生 |
  | -------- | -------- |
  | tzgg     | sszs     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'sszs';
    const info = yjszs.get(type);
    if (!info) {
        throw new InvalidParameterError('invalid type');
    }
    const link = `${host}/pubweb/homePageList/${info.view}.view?keyId=${info.keyId ?? ''}`;
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
