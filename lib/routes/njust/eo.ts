// @ts-nocheck
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { getContent } = require('./utils');

const map = new Map([
    ['16tz', { title: '南京理工大学电光16 -- 通知公告', id: '/_t217/tzgg' }],
    ['16dt', { title: '南京理工大学电光16 -- 主任寄语', id: '/_t217/zrjy' }],
    ['17tz', { title: '南京理工大学电光17 -- 年级通知', id: '/_t689/njtz' }],
    ['17dt', { title: '南京理工大学电光17 -- 每日动态', id: '/_t689/mrdt' }],
    ['18tz', { title: '南京理工大学电光18 -- 年级通知', id: '/_t900/njtz_10234' }],
    ['18dt', { title: '南京理工大学电光18 -- 主任寄语', id: '/_t900/zrjy_10251' }],
    ['19tz', { title: '南京理工大学电光19 -- 通知公告', id: '/_t1163/tzgg_11606' }],
    ['19dt', { title: '南京理工大学电光19 -- 每日动态', id: '/_t1163/mrdt_11608' }],
]);

const host = 'https://dgxg.njust.edu.cn';

export default async (ctx) => {
    const grade = ctx.req.param('grade') ?? '17';
    const type = ctx.req.param('type') ?? 'tz';
    let info = map.get(grade + type);
    if (!info) {
        // throw new Error('invalid type');
        info = { title: '', id: '/' + grade + '/' + type };
    }
    const id = info.id;
    const siteUrl = host + id + '/list.htm';

    const html = await getContent(siteUrl, true);
    const $ = load(html);
    if (!info.title) {
        info.title = $('title').text();
    }
    const list = $('li.list_item');

    ctx.set('data', {
        title: info.title,
        link: siteUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item).find('a').text().trim(),
                    pubDate: timezone(parseDate($(item).find('span.Article_PublishDate').text(), 'YYYY-MM-DD'), +8),
                    link: $(item).find('a').attr('href'),
                }))
                .get(),
    });
};
