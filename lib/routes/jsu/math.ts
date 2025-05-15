import { Route } from '@/types';
import cache from '@/utils/cache';
// 导入必要的模组
import got from '@/utils/got'; // 自订的 got
import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器
import { parseDate } from '@/utils/parse-date';
import { getPageItemAndDate } from './utils';

export const route: Route = {
    path: '/stxy',
    categories: ['university'],
    example: '/jsu/stxy',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '数学与统计学院 - 通知公告',
    maintainers: ['wenjia03'],
    handler,
};

async function handler() {
    const baseUrl = 'https://stxy.jsu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'https://stxy.jsu.edu.cn/index/tzgg1.htm',
    });

    const $ = load(response.data);
    const list = $('div.art_list').toArray();
    const out = await Promise.all(
        list.map((item) => {
            item = $(item);
            const link = new URL(item.find('a').attr('href'), baseUrl).href;
            return cache.tryGet(link, async () => {
                const description = await getPageItemAndDate('#right_con > form > div.articleInfo', link, '#right_con > form > div.articleTitle', '#right_con > form > div.articleAuthor > span:nth-child(1)');
                const pubDate = parseDate(description.date, 'YYYY年MM月DD日 HH:mm');
                return {
                    title: description.title,
                    link,
                    pubDate,
                    description: description.pageInfo,
                    category: '通知公告',
                };
            });
        })
    );

    return {
        title: '吉首大学数学与统计学院 - 通知公告',
        link: 'https://stxy.jsu.edu.cn/index/tzgg1.htm',
        description: '吉首大学数学与统计学院 - 通知公告',
        item: out,
    };
}
