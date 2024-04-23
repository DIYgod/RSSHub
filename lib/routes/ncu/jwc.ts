import { Route } from '@/types';
import got from '@/utils/got'; // 自订的 got
import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/ncu/jwc',
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
            source: ['jwc.ncu.edu.cn/', 'jwc.ncu.edu.cn/jwtz/index.htm'],
        },
    ],
    name: '教务通知',
    maintainers: ['ywh555hhh'],
    handler,
    url: 'jwc.ncu.edu.cn/',
};

async function handler() {
    const baseUrl = 'https://jwc.ncu.edu.cn';
    const response = await got(baseUrl);
    const $ = load(response.body);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const list = $('.box3 .inner ul.img-list li');

    return {
        title: '南昌大学教务处',
        link: baseUrl,
        description: '南昌大学教务处',

        item:
            list &&
            list.toArray().map((item) => {
                const el = $(item);
                const linkEl = el.find('a');
                const date = el.text().split('】')[0].replace('【', '').trim();
                const title = linkEl.attr('title');
                const link = `${baseUrl}/${linkEl.attr('href')}`;

                const newsDate = parseDate(date, 'MM-DD');
                const newsMonth = newsDate.getMonth() + 1;

                // If the news month is greater than the current month, subtract 1 from the year
                const year = newsMonth > currentMonth ? currentYear - 1 : currentYear;

                newsDate.setFullYear(year);

                return {
                    title,
                    link,
                    pubDate: newsDate,
                };
            }),
    };
}
