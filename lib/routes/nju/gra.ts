// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://grawww.nju.edu.cn/905/list.htm',
    });

    const data = response.data;

    const $ = load(data);
    const list = $('li.news');

    ctx.set('data', {
        title: '研究生院-动态通知',
        link: 'https://grawww.nju.edu.cn/905/list.htm',
        item: list
            .map((index, item) => {
                item = $(item);

                const year = item.find('.news_days').first().text();
                const day = item.find('.news_year').first().text(); // :)
                if (!year.length || !day.length) {
                    return null;
                } // 去掉友情链接

                return {
                    title: item.find('a').attr('title'),
                    link: 'https://grawww.nju.edu.cn' + item.find('a').attr('href'),
                    pubDate: timezone(parseDate(year + day, 'YYYYMM-DD'), +8),
                };
            })
            .get()
            .filter(Boolean),
    });
};
