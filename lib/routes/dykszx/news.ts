import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const HOST = 'https://www.dykszx.com';

const getContent = async (href) => {
    const newsPage = `${HOST}${href}`;
    const response = await got.get(newsPage);
    const $ = load(response.data);
    const newsTime =
        $('body > div:nth-child(3) > div.page.w > div.shuxing.w')
            .text()
            .trim()
            .match(/时间：(.*?)点击/g)?.[0] || '';
    // 移除二维码
    $('.sjlook').remove();
    const content = $('#show-body').html() || '';
    return { newsTime, content, newsPage };
};

const newsTypeObj = {
    all: { selector: '#nrs > li > b', name: '新闻中心' },
    gwy: { selector: 'body > div:nth-child(3) > div:nth-child(8) > ul > li', name: '公务员考试' },
    sydw: { selector: 'body > div:nth-child(3) > div:nth-child(9) > ul > li', name: '事业单位考试' },
    zyzc: { selector: 'body > div:nth-child(3) > div:nth-child(10) > ul > li', name: '执（职）业资格、职称考试' },
    other: { selector: 'body > div:nth-child(3) > div:nth-child(11) > ul > li', name: '其他考试' },
};

async function handler(ctx) {
    const newsType = ctx.req.param('newsType') || 'all';
    const response = await got(HOST);
    const data = response.data;
    const $ = load(data);
    const newsList = $(newsTypeObj[newsType].selector).toArray();

    const newsDetail = await Promise.all(
        newsList.map((item) => {
            const href = item.children[0].attribs.href;
            return cache.tryGet(href, async () => {
                const newsContent = await getContent(href);
                return {
                    title: item.children[0].children[0].data,
                    description: newsContent.content,
                    link: newsContent.newsPage,
                    pubDate: timezone(parseDate(newsContent.newsTime, '时间：YYYY-MM-DD HH:mm:ss'), +8),
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
            source: ['www.dykszx.com/'],
            target: '/news/all',
        },
    ],
    name: '考试新闻发布',
    maintainers: ['zytomorrow'],
    handler,
    url: 'www.dykszx.com',
    description: `| 新闻中心 | 公务员考试 | 事业单位 | （职）业资格、职称考试 | 其他 |
| :------: | :------: | :------: |:------: |:------: |
|   all   |   gwy   |  sydw | zyzc  | other |`,
};
