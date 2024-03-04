// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const host = 'https://ccnu.91wllm.com';
    const link = `${host}/news/index/tag/tzgg`;

    const response = await got(link);

    const $ = load(response.data);
    const list = $('.newsList');

    const items =
        list &&
        list.toArray().map((item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                pubDate: parseDate(item.find('.y').text(), 'YYYY-MM-DD'),
                link: `${host}${a.attr('href')}`,
            };
        });

    ctx.set('data', {
        title: '华中师范大学就业信息',
        link,
        item: items,
    });
};
