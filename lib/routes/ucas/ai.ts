// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const baseUrl = 'https://ai.ucas.ac.cn';
    const link = `${baseUrl}/index.php/zh-cn/tzgg`;
    const response = await got(link);
    const $ = load(response.data);
    const list = $('.b-list li');

    ctx.set('data', {
        title: '中科院人工智能所',
        link,
        description: '中科院人工智能通知公告',
        item:
            list &&
            list.toArray().map((item) => {
                item = $(item);
                const a = item.find('a');
                return {
                    title: a.text(),
                    link: `${baseUrl}${a.attr('href')}`,
                    pubDate: parseDate(item.find('.m-date').text(), 'YYYY-MM-DD'),
                };
            }),
    });
};
