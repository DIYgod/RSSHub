import got from '@/utils/got';
import { load } from 'cheerio';

const baseUrl = 'https://jw.qust.edu.cn/';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${baseUrl}jwtz.htm`,
    });
    const $ = load(response.data);
    const items = $('.winstyle60982 tr a.c60982')
        .map((_, element) => {
            const linkElement = $(element);
            const itemTitle = linkElement.text().trim();
            const path = linkElement.attr('href');
            const itemUrl = path.startsWith('http') ? path : `${baseUrl}${path}`;
            return {
                title: itemTitle,
                link: itemUrl,
            };
        })
        .get();

    ctx.set('data', {
        title: '青岛科技大学 - 教务通知',
        link: `${baseUrl}jwtz.htm`,
        item: items,
    });
};
