// @ts-nocheck
import cache from '@/utils/cache';
// 导入必要的模组
import got from '@/utils/got'; // 自订的 got
import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器
import { parseDate } from '@/utils/parse-date';
const { getPageItemAndDate } = require('./utils');

export default async (ctx) => {
    const baseUrl = 'https://rjxy.jsu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'https://rjxy.jsu.edu.cn/index/tzgg1.htm',
    });

    const $ = load(response.data);
    const list = $('body > div.list-box > div > ul > li').toArray();
    const out = await Promise.all(
        list.map((item) => {
            item = $(item);
            const link = new URL(item.find('a').attr('href'), baseUrl).href;
            return cache.tryGet(link, async () => {
                const category = '通知公告';
                const description = await getPageItemAndDate('#vsb_content', link, 'body > form > div > h1', 'body > form > div > div.label', (date) => date.split('  点击：')[0]);
                const pubDate = parseDate(description.date, 'YYYY年MM月DD日 HH:mm');
                return {
                    title: description.title,
                    link,
                    pubDate,
                    description: description.pageInfo,
                    category,
                };
            });
        })
    );

    ctx.set('data', {
        // 在此处输出您的 RSS
        title: '吉首大学计算机科学与工程学院 - 通知公告',
        link: 'https://rjxy.jsu.edu.cn/index/tzgg1.htm',
        description: '吉首大学计算机科学与工程学院 - 通知公告',
        item: out,
    });
};
