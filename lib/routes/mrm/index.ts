// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { category = 'zonghezixun3' } = ctx.req.param();
    const baseUrl = 'http://www.mrm.com.cn';
    const link = `${baseUrl}/${category}.html`;

    const { data: response } = await got(link);
    const $ = load(response);

    const list = $('#datalist_wap .li')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text().trim(),
                link: `${baseUrl}${a.attr('href')}`,
                pubDate: parseDate(item.find('.d').text(), 'YYYY.MM.DD'),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data } = await got(item.link);
                const $ = load(data);

                item.description = $('.article-cont').html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        link,
        item: items,
    });
};
