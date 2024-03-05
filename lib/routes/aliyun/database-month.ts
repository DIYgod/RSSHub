// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const url = 'http://mysql.taobao.org/monthly/';
    const response = await got({ method: 'get', url });
    const $ = load(response.data);

    const list = $("ul[class='posts'] > li")
        .map((i, e) => {
            const element = $(e);
            const title = element.find('a').text().trim();
            const link = `http://mysql.taobao.org${element.find('a').attr('href').trim()}/`;
            return {
                title,
                description: '',
                link,
            };
        })
        .get();

    const result = await Promise.all(
        list.map((item) => {
            const link = item.link;

            return cache.tryGet(link, async () => {
                const itemReponse = await got(link);
                const itemElement = load(itemReponse.data);
                item.description = itemElement('.content').html();
                return item;
            });
        })
    );

    ctx.set('data', {
        title: $('title').text(),
        link: url,
        item: result.reverse(),
    });
};
