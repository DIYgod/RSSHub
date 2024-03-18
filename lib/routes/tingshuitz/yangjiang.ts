import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yangjiang',
    categories: ['forecast'],
    example: '/tingshuitz/yangjiang',
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
            source: ['yjsswjt.com/zxdt_list.jsp', 'yjsswjt.com/'],
        },
    ],
    name: '阳江市',
    maintainers: ['ciaranchen'],
    handler,
    url: 'yjsswjt.com/zxdt_list.jsp',
};

async function handler() {
    const url = 'https://www.yjsswjt.com/zxdt_list.jsp?flbz=7';
    const response = await got(url);

    const $ = load(response.data);
    const list = $('div.list_ul_div > ul > li');

    return {
        title: '停水通知 - 阳江市水务集团有限公司',
        link: 'https://www.yjsswjt.com/zxdt_list.jsp?flbz=7',
        item: list
            .map((_, el) => {
                const item = $(el);

                const id = item.find('a').attr('href').slice(17, -1);
                return {
                    title: item.find('span').text().trim(),
                    description: item.find('span').text().trim(),
                    link: 'http://www.yjsswjt.com/list.jsp?id=' + id,
                    pubDate: parseDate(item.find('.datetime').text(), 'YYYY.MM.DD'),
                };
            })
            .get(),
    };
}
