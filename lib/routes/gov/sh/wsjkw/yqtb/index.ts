import { Route } from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: ['/sh/wsjkw/yqtb', '/shanghai/wsjkw/yqtb'],
    categories: ['government'],
    example: '/gov/sh/wsjkw/yqtb',
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
            source: ['wsjkw.sh.gov.cn/'],
        },
    ],
    name: '上海卫健委 疫情通报',
    maintainers: ['zcf0508'],
    handler,
    url: 'wsjkw.sh.gov.cn/',
};

async function handler() {
    const url = `https://wsjkw.sh.gov.cn/yqtb/index.html`;

    const res = await got.get(url);
    const $ = load(res.data);
    const list = $('.uli16.nowrapli.list-date  li');
    return {
        title: '疫情通报-上海卫健委',
        link: url,
        item: list.toArray().map((item) => {
            item = $(item);
            const title = item.find('a').text();
            const address = item.find('a').attr('href');
            const host = `https://wsjkw.sh.gov.cn`;
            const pubDate = parseDate(item.find('span').text(), 'YYYY-MM-DD');
            return {
                title,
                description: title,
                pubDate,
                link: host + address,
                guid: host + address,
            };
        }),
    };
}
