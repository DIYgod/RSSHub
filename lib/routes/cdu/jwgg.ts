import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/jwgg',
    categories: ['university'],
    example: '/cdu/jwgg',
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
            source: ['jw.cdu.edu.cn/'],
        },
    ],
    name: '教务处通知公告',
    maintainers: ['uuwor'],
    handler,
    url: 'https://jw.cdu.edu.cn/', // 完整的 URL 地址
};

async function handler() {
    const url = 'https://jw.cdu.edu.cn/jwgg.htm'; // 数据来源网页（待提取网页）
    const response = await got.get(url); // 从一个对象中提取属性
    const data = response.data; // 从一个对象(response)中提取属性
    const $ = load(data); // load 函数将处理 data 并返回一个值，这个值会被赋值给 $。
    
    const list = $('.ListTable.dataTable.no-footer tbody tr.odd')
        .slice(0, 10)
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('a').text().trim(); // 修正选择器，直接查找 <a> 标签
            const link = element.find('a').attr('href');
            const dateMatch = element.find('td.columnDate').text().match(/\d{4}-\d{2}-\d{2}/);
            const pubDate = dateMatch ? timezone(parseDate(dateMatch[0]), 8) : null; // 添加检查以避免空值

            return {
                title,
                link: `https://jw.cdu.edu.cn/${link}`, // 使用模板字符串使拼接更清晰
                author: '成都大学教务处通知公告', // 固定作者信息
                pubDate,
            };
        });

    const result = await Promise.all(
        list.map(async (item) =>
            cache.tryGet(item.link, async () => {
                const itemResponse = await got.get(item.link);
                const itemData = itemResponse.data;
                const itemElement = load(itemData);

                item.description = itemElement('.v_news_content').html(); // 提取描述内容

                return item;
            })
        )
    );

    return {
        title: '成大教务处通知公告',
        link: url,
        item: result.filter(item => item.pubDate), // 过滤掉没有发布日期的项目
    };
}
