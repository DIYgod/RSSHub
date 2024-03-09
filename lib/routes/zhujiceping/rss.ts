import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const url = 'https://www.zhujiceping.com/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);

    const list = $('article.excerpt')
        .map((i, e) => {
            const element = $(e);
            const title = element.find('h2 > a').attr('title');
            const link = element.find('h2 > a').attr('href');
            const description = element.find('p.note').text();
            const dateraw = element.find('time').text();

            return {
                title,
                description,
                link,
                pubDate: parseDate(dateraw, 'YYYY-MM-DD'),
            };
        })
        .get();

    ctx.set('data', {
        title: '国外主机测评',
        link: url,
        item: list,
    });
};
