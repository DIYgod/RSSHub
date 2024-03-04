// @ts-nocheck
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { getContent } = require('./utils');

const map = new Map([
    ['tzgg', { title: '南京理工大学财务处 -- 通知公告', id: '/12432' }],
    ['bslc', { title: '南京理工大学财务处 -- 办事流程', id: '/1382' }],
]);

const host = 'https://cwc.njust.edu.cn';

export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'tzgg';
    const info = map.get(type);
    if (!info) {
        throw new Error('invalid type');
    }
    const id = info.id;
    const siteUrl = host + id + '/list.htm';

    const html = await getContent(siteUrl, true);
    const $ = load(html);
    const list = $('ul.news_list').find('li');

    ctx.set('data', {
        title: info.title,
        link: siteUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item).find('a').attr('title').trim(),
                    pubDate: timezone(parseDate($(item).find('span.news_meta').text(), 'YYYY-MM-DD'), +8),
                    link: $(item).find('a').attr('href'),
                }))
                .get(),
    });
};
