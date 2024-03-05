// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { load } from 'cheerio';
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

export default async (ctx) => {
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

    ctx.set('data', {
        title: 'CCTV 新闻联播',
        link: 'http://tv.cctv.com/lm/xwlb/',
        item: resultItems,
    });
};
