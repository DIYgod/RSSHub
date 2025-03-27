import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/tzggcdunews',
    categories: ['university'],
    example: '/cdu/tzggcdunews',
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
            source: ['news.cdu.edu.cn/'],
        },
    ],
    name: '成都大学官网通知公告',
    maintainers: ['uuwor'],
    handler,
    url: 'news.cdu.edu.cn/',
};

async function handler() {
    const url = 'https://news.cdu.edu.cn/tzgg.htm';     // 数据来源网页（待提取网页）
    const response = await got.get(url);                //从一个对象中提取属性
    const data = response.data;                         //从一个对象(response)中提取属性
    const $ = load(data);                               //load函数将处理 data 并返回一个值，这个值会被赋值给 $。
    const list = $('.row-f1 a[target="_blank"].con')
        .slice(0, 10)                                   /*slice() 是一个用于数组或类数组对象的方法，它返回从指定起始位置（包括）到结束位置（不包括）的一个新数组。
                                                        在此，.slice(0, 10) 表示从选择的表格行中取出前 10 个元素（即选择从第 0 行到第 9 行的数据）。*/
        .toArray()                                      //toArray() 是 jQuery 中的一个方法，它将选中的 jQuery 对象（实际上是一个类数组对象）转换成一个标准的 JavaScript 数组。这样，原本是一个 jQuery 对象的集合会变成普通的 JavaScript 数组，方便进一步操作或处理。
        .map((e) => {
            const element = $(e);
            const title = element.find('a.con').text().trim();       /* 1.选择器
                                                                        2..text()：该方法获取选中元素的文本内容。
                                                                        3..trim()：用于去掉字符串前后的空格，确保得到干净的文本。*/
            const link = element.find('a.con').attr('href');
            const date = element
                .find('a.con div.date')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/);
            const pubDate = timezone(parseDate(date), 8);

            return {
                title,
                link: 'https://news.cdu.edu.cn/' + link,
                author: '成都大学官网通知公告',
                pubDate,
            };
        });

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const itemReponse = await got.get(item.link);
                const data = itemReponse.data;
                const itemElement = load(data);

                item.description = itemElement('.v_news_content').html();

                return item;
            })
        )
    );

    return {
        title: '成都大学官网-通知公告',
        link: url,
        item: result,
    };
}
