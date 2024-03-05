// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

const baseUrl = 'https://jw.qust.edu.cn/';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${baseUrl}jwtz.htm`,
    });
    const $ = load(response.data);
    const items = [];
    $('.winstyle60982 tr').each((_, element) => {
        const linkElement = $(element).find('a.c60982');
        if (linkElement.length > 0) {
            const itemTitle = linkElement.text().trim();
            const path = linkElement.attr('href');
            const itemUrl = path.startsWith('http') ? path : `${baseUrl}/${path}`;
            items.push({
                title: itemTitle,
                link: itemUrl,
            });
        }
    });

    ctx.set('data', {
        title: '青岛科技大学 - 教务通知',
        link: `${baseUrl}jwtz.htm`,
        item: items,
    });
};
