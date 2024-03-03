// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const baseUrl = 'http://www.tynu.edu.cn';

export default async (ctx) => {
    const link = `${baseUrl}/index/tzgg.htm`;
    const response = await got(link);
    const data = response.data;

    const $ = load(data);
    const list = $('.news_content_list')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h3').text(),
                link: new URL(item.find($('a')).attr('href'), baseUrl).href,
                pubDate: parseDate(item.find('.content_list_time').text(), 'YYYYMM-DD'),
            };
        });

    await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                item.description = $('#vsb_content').html() + ($('.content ul').not('.btm-cate').html() || '');
                return item;
            })
        )
    );

    ctx.set('data', {
        title: '太原师范学院通知公告',
        link,
        item: list,
    });
};
