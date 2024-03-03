// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const category = ctx.req.param('category');
    const url = category ? `https://jiaowc.lsnu.edu.cn/tzgg/${category}.htm` : 'https://jiaowc.lsnu.edu.cn/tzgg.htm';

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;

    const $ = load(data);
    const list = $('tr[id^="line_u5_"]').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = load(item);
            const title = $('a').attr('title');
            const link = `https://jiaowc.lsnu.edu.cn/${$('a').attr('href')}`;
            const date = $('td[width="80"]').text();

            const single = await cache.tryGet(link, async () => {
                const response = await got({
                    method: 'get',
                    url: link,
                });

                const articleData = response.data;
                const article$ = load(articleData);
                const description = article$('.v_news_content').html();

                return {
                    title,
                    link,
                    description,
                    pubDate: new Date(date).toUTCString(),
                };
            });

            return single;
        })
    );

    ctx.set('data', {
        title: '乐山师范学院教学部通知公告',
        link: 'https://jiaowc.lsnu.edu.cn/tzgg.htm',
        item: out,
    });
};
