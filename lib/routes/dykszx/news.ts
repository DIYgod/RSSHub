import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const HOST = 'https://www.dykszx.cn';

const getContent = async (href) => {
    const newsPage = `${HOST}${href}`;
    const response = await got.get(newsPage);
    const $ = load(response.data);
    const newsTime =
        $('.shuxing')
            .text()
            .trim()
            .match(/时间：(.*?)点击/g)?.[0] || '';
    // 移除二维码
    $('.sjlook').remove();
    const content = $('#show-body').html();
    return { newsTime, content, newsPage, title: $('.ptitle').text() };
};

const newsTypeObj = {
    all: { selector: '#nrs > li > b', name: '新闻中心' },
    gwy: { selector: '.public:has(.title a[href="index.php?catid=19"]) > ul > li', name: '公务员考试' },
    sydw: { selector: '.public:has(.title a[href="index.php?catid=20"]) > ul > li', name: '事业单位考试' },
    zyzc: { selector: '.public:has(.title a[href="index.php?catid=21"]) > ul > li', name: '执（职）业资格、职称考试' },
    other: { selector: '.public:has(.title a[href="index.php?catid=22"]) > ul > li', name: '其他考试' },
};

async function handler(ctx) {
    const newsType = ctx.req.param('newsType') || 'all';
    if (!Object.hasOwn(newsTypeObj, newsType)) {
        throw new InvalidParameterError(`Invalid news type: ${newsType}. Use all, gwy, sydw, zyzc, or other.`);
    }
    const response = await got(HOST);
    const data = response.data;
    const $ = load(data);
    const newsList = $(newsTypeObj[newsType].selector).toArray();

    const newsDetail = await Promise.all(
        newsList.map((item) => {
            const href = item.children[0].attribs.href;
            return cache.tryGet(`dykszx:article:${href}`, async () => {
                const newsContent = await getContent(href);
                return {
                    title: newsContent.title || item.children[0].children[0].data,
                    description: newsContent.content,
                    link: newsContent.newsPage,
                    pubDate: timezone(parseDate(newsContent.newsTime, '时间：YYYY-MM-DD HH:mm:ss'), 8),
                };
            });
        })
    );
    return {
        title: `考试新闻发布(${newsTypeObj[newsType].name})`,
        link: HOST,
        description: `德阳人事考试网 考试新闻发布 (${newsTypeObj[newsType].name})`,
        item: newsDetail,
    };
}

export const route: Route = {
    path: '/news/:newsType?',
    categories: ['government'],
    example: '/dykszx/news',
    parameters: { newsType: '考试类型。默认新闻中心(all)' },
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
            source: ['www.dykszx.cn/'],
            target: '/news/all',
        },
    ],
    name: '考试新闻发布',
    maintainers: ['zytomorrow'],
    handler,
    url: 'www.dykszx.cn',
    description: `| 新闻中心 | 公务员考试 | 事业单位 | （职）业资格、职称考试 |  其他 |
| :------: | :--------: | :------: | :--------------------: | :---: |
|    all   |     gwy    |   sydw   |          zyzc          | other |`,
};
