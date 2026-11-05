import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/phy/:category/:column/:subcolumn?',
    categories: ['university'],
    example: '/jlu/phy/xzgz/tzgg',
    parameters: {
        category: '分类，为「行政工作」、「科学研究」、「人才培养」的拼音小写首字母。',
        column: '栏目，当分类为「行政工作」时，为「通知公告」、「学院新闻」、「学院文件」的拼音小写首字母。当分类为「科学研究」时，为「科研动态」、「学术活动」的拼音小写首字母。当分类为「人才培养」时。为「本科生教育」、「研究生教育」、「学团工作」的拼音小写首字母。',
        subcolumn: '子栏目。当栏目为「本科生教育」时，为「本科资讯」的拼音大写首字母，或为「教育思想大讨论系列活动」、「培养方案」的拼音小写首字母。当栏目为「研究生教育」时，为「教学通知」的拼音小写首字母。',
    },
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
            source: ['phy.jlu.edu.cn/xzgz/:column'],
            target: '/phy/xzgz/:column',
        },
        {
            source: ['phy.jlu.edu.cn/xzgz/:column/:subcolumn'],
            target: '/phy/xzgz/:column/:subcolumn',
        },
        {
            source: ['phy.jlu.edu.cn/kxyj/:column'],
            target: '/phy/kxyj/:column',
        },
        {
            source: ['phy.jlu.edu.cn/kxyj/:column/:subcolumn'],
            target: '/phy/kxyj/:column/:subcolumn',
        },
        {
            source: ['phy.jlu.edu.cn/rcpy/:column'],
            target: '/phy/rcpy/:column',
        },
        {
            source: ['phy.jlu.edu.cn/rcpy/:column/:subcolumn'],
            target: '/phy/rcpy/:column/:subcolumn',
        },
    ],
    name: '物理学院',
    maintainers: ['tsurumi-yizhou'],
    url: 'phy.jlu.edu.cn',
    handler: async (ctx) => {
        const { category, column, subcolumn } = ctx.req.param();
        const query = (subcolumn ? `${column}/${subcolumn}` : column).replace(/\.htm$/, '');
        const currentUrl = `https://phy.jlu.edu.cn/${category}/${query}.htm`;
        const response = await got(currentUrl);
        const $ = load(response.body);
        const list = $('.tit-list ul li');

        return {
            title: '吉林大学物理学院',
            link: 'https://phy.jlu.edu.cn/',
            description: '吉林大学物理学院',
            item: list.toArray().map((item) => {
                const element = $(item).find('a');
                const title = element.find('.tl-top').find('h3').text();
                const link = new URL(element.attr('href')!, currentUrl).href;
                const date = element.find('.tl-top').find('.tl-date');
                const pubDate = date.find('span').text().replaceAll('/', '').trim() + '-' + date.find('b').text();
                return {
                    title,
                    link,
                    pubDate: /^\d{4}-\d{1,2}-\d{1,2}$/.test(pubDate) ? timezone(parseDate(pubDate, 'YYYY-MM-DD'), 8) : undefined,
                };
            }),
        };
    },
};
