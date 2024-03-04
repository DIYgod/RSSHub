// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const url = 'http://kyc.bjfu.edu.cn/tztg/index.html';
    const response = await got.get(url);
    const data = response.data;
    const $ = load(data);
    const list = $('.ll_con_r_b li')
        .slice(0, 15)
        .toArray()
        .map((e) => {
            const element = $(e);
            const title = element.find('.ll_con_r_b_title a').text();
            const link = element.find('a').attr('href');
            const date = element
                .find('.ll_con_r_b_time')
                .text()
                .match(/\d{4}-\d{2}-\d{2}/);
            const pubDate = timezone(parseDate(date), 8);

            return {
                title,
                link: 'http://kyc.bjfu.edu.cn/tztg/' + link,
                author: '北京林业大学科技处通知公告',
                pubDate,
            };
        });

    const result = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const itemReponse = await got.get(item.link);
                const data = itemReponse.data;
                const itemElement = load(data);

                item.description = itemElement('#a_con_l_con').html();
                item.title = item.title.includes('...') ? itemElement('#a_con_l_title').text() : item.title;

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '北林科技处通知',
        link: url,
        item: result,
    });
};
