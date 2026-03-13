import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
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
    const url = 'https://jw.cdu.edu.cn/jwgg.htm'; // 数据来源网页（待提取网页）
    const response = await got.get(url);
    const data = response.data;
    const $ = load(data);
    const list = $('.ListTable.dataTable.no-footer tbody tr[role="row"].odd')
        .slice(0, 10)
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('tr.odd a').text().trim(); /* 1.选择器 tr.odd a：这个选择器查找具有 class="odd" 的 <tr> 元素下的 <a> 标签。
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
