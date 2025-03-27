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
    url: 'jw.cdu.edu.cn/',
};

async function handler() {
    const url = 'https://jw.cdu.edu.cn/jwgg.htm';     // 数据来源网页（待提取网页）
    const response = await got.get(url);              //从一个对象中提取属性
    const data = response.data;                       //从一个对象(response)中提取属性
    const $ = load(data);                             //load函数将处理 data 并返回一个值，这个值会被赋值给 $。
    const list = $('.ListTable.dataTable.no-footer tbody tr[role="row"].odd')    /*$('.ListTable.dataTable.no-footer tbody tr[role="row"].odd') 是一个 jQuery 选择器。它用来选择符合特定条件的 DOM 元素。
                                                                                    $('.ListTable'): 选择类名为 ListTable 的元素。
                                                                                    .dataTable: 选择同时具有 dataTable 类的元素。
                                                                                    .no-footer: 选择同时具有 no-footer 类的元素。
                                                                                    tbody: 选择 tbody 元素，通常是表格内容部分。
                                                                                    tr[role="row"]: 选择具有 role="row" 属性的 tr 元素，通常用于表格中的一行数据。
                                                                                    .odd: 选择具有 odd 类的 tr 元素，通常用于表示表格的奇数行。
                                                                                    总结：此选择器会选择所有类名为 ListTable、dataTable 和 no-footer 的表格中的 tbody 元素内、具有 role="row" 属性且同时具有 odd 类的表格行（tr 元素）。*/
        .slice(0, 10)            /*slice() 是一个用于数组或类数组对象的方法，它返回从指定起始位置（包括）到结束位置（不包括）的一个新数组。
                                    在此，.slice(0, 10) 表示从选择的表格行中取出前 10 个元素（即选择从第 0 行到第 9 行的数据）。*/
        .toArray()                //toArray() 是 jQuery 中的一个方法，它将选中的 jQuery 对象（实际上是一个类数组对象）转换成一个标准的 JavaScript 数组。这样，原本是一个 jQuery 对象的集合会变成普通的 JavaScript 数组，方便进一步操作或处理。
        .map((e) => {
            const element = $(e);
            const title = element.find('tr.odd a').text().trim();        /* 1.选择器 tr.odd a：这个选择器查找具有 class="odd" 的 <tr> 元素下的 <a> 标签。
                                                                            2..text()：该方法获取选中元素的文本内容。
                                                                            3..trim()：用于去掉字符串前后的空格，确保得到干净的文本。*/
            const link = element.find('tr.odd a').attr('href');
            const date = element
                .find('tr.odd td.columnDate')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/);
            const pubDate = timezone(parseDate(date), 8);

            return {
                title,
                link: 'https://jw.cdu.edu.cn/' + link,
                author: '成都大学教务处通知公告',
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
        title: '成大教务处通知公告',
        link: url,
        item: result,
    };
}
