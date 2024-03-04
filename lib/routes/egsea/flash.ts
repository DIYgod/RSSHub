// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.egsea.com/news/flash-list?per-page=30',
    });

    const out = response.data.data.map((item) => {
        const pubDate = parseDate(item.pageTime, 'X');
        const link = 'https://www.egsea.com' + item.url;
        const title = item.title;
        const description = item.content;

        return {
            title,
            link,
            pubDate,
            description,
            category: item.tags.map((tag) => tag.name),
        };
    });

    ctx.set('data', {
        title: '快讯 - e 公司',
        link: 'https://www.egsea.com/news/flash',
        item: out,
    });
};
