// @ts-nocheck
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const url = 'https://www.zrblog.net/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);

    const list = $('div.art_img_box')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('h2 > a').attr('title');
            const link = element.find('h2 > a').attr('href');
            const description = element.find('p.intro').text();
            const dateraw = element.find('div.info').find('span').eq(0).text();

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, '发布日期：YYYY年MM月DD日'),
            };
        })
        .get();

    ctx.set('data', {
        title: '赵容部落',
        link: url,
        item: list,
    });
};
