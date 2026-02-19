import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器

import type { Route } from '@/types';
import got from '@/utils/got'; // 自订的 got

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/jlu/jwc',
    radar: [
        {
            source: ['jwc.jlu.edu.cn', 'jwc.jlu.edu.cn/index.htm'],
        },
    ],
    name: '教务通知',
    maintainers: ['mayouxi'],
    handler,
    url: 'jwc.jlu.edu.cn',
};

async function handler() {
    const baseUrl = 'https://jwc.jlu.edu.cn';
    const response = await got(baseUrl);
    const $ = load(response.body);

    const list = $('.section2 .s2-r .s3-list ul li');

    return {
        title: '吉林大学教务处',
        link: baseUrl,
        description: '吉林大学教务处通知公告',

        item: list?.toArray().map((item) => {
            const el = $(item);

            const linkEl = el.find('a');
            const YMDiv = el.find('.tm p');
            const YMStr = YMDiv.text().trim();
            const DDiv = el.find('.tm span');
            const DStr = DDiv.text().trim();

            const titleDiv = el.find('.s3-info p');
            const title = titleDiv.text().trim();

            const link = `${baseUrl}/${linkEl.attr('href')}`;

            const newsDate = new Date(YMStr + '-' + DStr);

            return {
                title,
                link,
                pubDate: newsDate,
            };
        }),
    };
}
