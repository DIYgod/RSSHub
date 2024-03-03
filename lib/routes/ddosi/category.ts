// @ts-nocheck
const envs = process.env;
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const url = 'https://www.ddosi.org/category';
    const userAgent = envs.UA || 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1';
    const category = ctx.req.param('category');
    const response = await got({
        method: 'get',
        url: `${url}/${category}/`,
        headers: {
            'User-Agent': userAgent,
            Referer: url,
        },
    });
    const $ = load(response.data);
    const list = $('main>article').get();

    const items = list.map((i) => {
        const item = $(i);

        const href = item.find('a:first-child').attr('href');
        const title = item.find('.entry-title a').text();
        const description = item.find('.entry-content p').text();
        const date = parseDate(item.find('.meta-date a time').attr('datetime'));

        return {
            title: String(title),
            description: String(description),
            pubDate: date,
            link: String(href),
        };
    });

    ctx.set('data', {
        title: `雨苁-${category}`,
        link: `${url}/${category}/`,
        item: items,
    });
};
