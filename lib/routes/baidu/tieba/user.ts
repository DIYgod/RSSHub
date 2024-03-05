// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const uid = ctx.req.param('uid');
    const response = await got(`https://tieba.baidu.com/home/main?un=${uid}`);

    const data = response.data;

    const $ = load(data);
    const name = $('span.userinfo_username').text();
    const list = $('div.n_right.clearfix');
    let imgurl;

    ctx.set('data', {
        title: `${name} 的贴吧`,
        link: `https://tieba.baidu.com/home/main?un=${uid}`,
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item).find('.n_contain');
                imgurl = item.find('ul.n_media.clearfix img').attr('original');
                return {
                    title: item.find('div.thread_name a').attr('title'),
                    pubDate: timezone(parseDate(item.parent().find('div .n_post_time').text(), ['YYYY-MM-DD', 'HH:mm']), +8),
                    description: `${item.find('div.n_txt').text()}<br><img src="${imgurl}">`,
                    link: item.find('div.thread_name a').attr('href'),
                };
            }),
    });
};
