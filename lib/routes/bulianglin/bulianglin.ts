// @ts-nocheck
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const url = 'https://bulianglin.com/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);

    const list = $('div.single-post')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('h2 > a').text();
            const link = element.find('h2 > a').attr('href');
            const description = element.find('p.summary').text();
            const dateraw = element.find('div.text-muted').find('li').eq(1).text();

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, 'YYYY 年 MM 月 DD 日'),
            };
        })
        .get();

    ctx.set('data', {
        title: '不良林',
        link: url,
        item: list,
    });
};
