// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const section = ctx.req.param('section') ?? 'zxzp';
    const domain = 'iolaw.cssn.cn';
    const response = await got(`http://${domain}/${section}/`);
    const data = response.data;

    const $ = load(data);
    const list = $('div.notice_right ul li')
        .map((_, item) => {
            item = $(item);
            const url = `http://${domain}` + item.find('a').attr('href').slice(1);
            const title = item.find('a div.title').text();
            const publish_time = parseDate(item.find('a p').text());
            return {
                title,
                link: url,
                author: '中国法学网',
                pubtime: publish_time,
            };
        })
        .get();

    ctx.set('data', {
        title: '中国法学网',
        url: `http://${domain}/${section}/`,
        description: '中国法学网',
        item: list.map((item) => ({
            title: item.title,
            pubDate: item.pubtime,
            link: item.link,
            author: item.author,
        })),
    });
};
