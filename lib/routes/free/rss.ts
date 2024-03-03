// @ts-nocheck
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export default async (ctx) => {
    const url = 'https://free.com.tw/';
    const response = await got(`${url}/wp-json/wp/v2/posts`);
    const list = response.data;
    ctx.set('data', {
        title: '免費資源網路社群',
        link: url,
        description: '免費資源網路社群 - 全部文章',
        item: list.map((item) => ({
            title: item.title.rendered,
            link: item.link,
            pubDate: parseDate(item.date_gmt),
            description: item.content.rendered,
        })),
    });
};
