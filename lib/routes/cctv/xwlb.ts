import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export const route: Route = {
    path: '/xwlb',
    categories: ['traditional-media'],
    example: '/cctv/xwlb',
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
            source: ['tv.cctv.com/lm/xwlb', 'tv.cctv.com/'],
        },
    ],
    name: '新闻联播',
    maintainers: ['zengxs'],
    handler,
    url: 'tv.cctv.com/lm/xwlb',
    description: `新闻联播内容摘要。`,
};

async function handler() {
    const res = await got({ method: 'get', url: 'https://tv.cctv.com/lm/xwlb/' });
    const $ = load(res.data);
    // 解析最新一期新闻联播的日期
    const latestDate = dayjs($('.rilititle p').text(), 'YYYY-MM-DD');
    const count = [];
    for (let i = 0; i < 20; i++) {
        count.push(i);
    }
    const resultItems = await Promise.all(
        count.map(async (i) => {
            const newsDate = latestDate.subtract(i, 'days').hour(19);
            const url = `https://tv.cctv.com/lm/xwlb/day/${newsDate.format('YYYYMMDD')}.shtml`;
            const item = {
                title: `新闻联播 ${newsDate.format('YYYY/MM/DD')}`,
                link: url,
                pubDate: timezone(parseDate(newsDate), +8),
                description: await cache.tryGet(url, async () => {
                    const res = await got(url);
                    const content = load(res.data);
                    const list = [];
                    content('body li').map((i, e) => {
                        e = content(e);
                        const href = e.find('a').attr('href');
                        const title = e.find('a').attr('title');
                        const dur = e.find('span').text();
                        list.push(`<a href="${href}">${title} ⏱${dur}</a>`);
                        return i;
                    });
                    return list.join('<br/>\n');
                }),
            };
            return item;
        })
    );

    return {
        title: 'CCTV 新闻联播',
        link: 'http://tv.cctv.com/lm/xwlb/',
        item: resultItems,
    };
}
