import { Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import dayjs from 'dayjs';
import puppeteer from '@/utils/puppeteer';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const baseUrl = 'https://sise.uestc.edu.cn/';

const mapId = {
    1: 'notice-1', // 最新
    2: 'notice-2', // 院办
    3: 'notice-3', // 学生科
    4: 'notice-4', // 教务科
    5: 'notice-5', // 研管科
    6: 'notice-6', // 组织
    7: 'notice-7', // 人事
    8: 'notice-8', // 实践教育中心
    9: 'notice-9', // Int'I
};

const mapTitle = {
    1: '最新',
    2: '院办',
    3: '学生科',
    4: '教务科',
    5: '研管科',
    6: '组织',
    7: '人事',
    8: '实践教育中心',
    9: "Int'I",
};

export const route: Route = {
    path: '/sise/:type?',
    categories: ['university'],
    example: '/uestc/sise/1',
    parameters: { type: '默认为 `1`' },
    features: {
        requireConfig: false,
        requirePuppeteer: true,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['sise.uestc.edu.cn/'],
            target: '/sise',
        },
    ],
    name: '信息与软件工程学院',
    maintainers: ['Yadomin', 'mobyw'],
    handler,
    url: 'sise.uestc.edu.cn/',
    description: `| 最新 | 院办 | 学生科 | 教务科 | 研管科 | 组织 | 人事 | 实践教育中心 | Int'I |
| ---- | ---- | ------ | ------ | ------ | ---- | ---- | ------------ | ----- |
| 1    | 2    | 3      | 4      | 5      | 6    | 7    | 8            | 9     |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') || 1;
    const divId = mapId[type];
    if (!divId) {
        throw new InvalidParameterError('type not supported');
    }

    const browser = await puppeteer({ stealth: true });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' ? request.continue() : request.abort();
    });
    await page.goto(baseUrl, {
        waitUntil: 'networkidle2',
    });
    const content = await page.content();
    await browser.close();

    const $ = load(content);

    const items = $(`div[id="${divId}"] p.news-item`);

    const out = $(items)
        .toArray()
        .map((item) => {
            item = $(item);
            const now = dayjs();
            let date = dayjs(now.year() + '-' + item.find('span').text().replace('/', '-'));
            if (now < date) {
                date = dayjs(now.year() - 1 + '-' + item.find('span').text().replace('/', '-'));
            }
            const newsTitle = item.find('a').text().replace('&amp;', '').trim();
            const newsLink = baseUrl + item.find('a').attr('href');
            const newsPubDate = parseDate(date);

            return {
                title: newsTitle,
                link: newsLink,
                pubDate: newsPubDate,
            };
        });

    return {
        title: `信软学院通知-${mapTitle[type]}`,
        link: baseUrl,
        description: '电子科技大学信息与软件工程学院通知',
        item: out,
    };
}
