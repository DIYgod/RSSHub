// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const link = 'https://yz.tongji.edu.cn/zsxw/ggtz.htm';
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.list_main_content li');

    ctx.set('data', {
        title: '同济大学研究生院',
        link,
        description: '同济大学研究生院通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.attr('title'),
                    link: new URL(a.attr('href'), link).href,
                    pubDate: parseDate(item.find('span').text(), 'YYYY-MM-DD'),
                };
            }),
    });
};
