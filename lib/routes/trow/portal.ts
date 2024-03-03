// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    let data;
    const response = await got.extend({ followRedirect: false }).get({
        url: `https://trow.cc`,
    });
    if (response.statusCode === 302) {
        const response2 = await got.extend({ followRedirect: false }).get({
            url: `https://trow.cc`,
            headers: {
                cookie: response.headers['set-cookie'],
            },
        });
        data = response2.data;
    } else {
        data = response.data;
    }

    const $ = load(data);
    const list = $('#portal_content .borderwrap[style="display:show"]');

    ctx.set('data', {
        title: `The Ring of Wonder - Portal`,
        link: `https://trow.cc`,
        description: `The Ring of Wonder 首页更新`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const dateraw = item.find('.postdetails').text();
                    return {
                        title: item.find('.maintitle p:nth-child(2) > a').text(),
                        description: item.find('.portal_news_content .row18').html(),
                        link: item.find('.maintitle p:nth-child(2) > a').attr('href'),
                        author: item.find('.postdetails a').text(),
                        pubDate: timezone(parseDate(dateraw.slice(3), 'YYYY-MM-DD, HH:mm'), +8),
                    };
                })
                .get(),
    });
};
