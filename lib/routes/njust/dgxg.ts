// @ts-nocheck
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
const { getContent } = require('./utils');

const map = new Map([
    ['gstz', { title: '南京理工大学电光学院研学网 -- 公示通知', id: '/6509' }],
    ['xswh', { title: '南京理工大学电光学院研学网 -- 学术文化', id: '/6511' }],
    ['jyzd', { title: '南京理工大学电光学院研学网 -- 就业指导', id: '/6510' }],
]);

const host = 'https://dgxg.njust.edu.cn';

export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'gstz';
    const info = map.get(type);
    if (!info) {
        throw new Error('invalid type');
    }
    const id = info.id;
    const siteUrl = host + id + '/list.htm';

    const html = await getContent(siteUrl, true);
    const $ = load(html);
    const list = $('ul.wp_article_list').find('li');

    ctx.set('data', {
        title: info.title,
        link: siteUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item).find('a').attr('title').trim(),
                    pubDate: timezone(parseDate($(item).find('span.Article_PublishDate').text(), 'YYYY-MM-DD'), +8),
                    link: $(item).find('a').attr('href'),
                }))
                .get(),
    });
};
