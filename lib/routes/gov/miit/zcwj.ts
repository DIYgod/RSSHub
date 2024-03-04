// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const base_url = 'http://www.miit.gov.cn/n1146295/n1652858/';
    const response = await got.get(base_url);
    const $ = load(response.data);
    const list = $('.clist_con li').get();

    const ProcessFeed = (data) => {
        const $ = load(data);

        const content = $('p');
        return content.text();
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = load(item);
            const $a = $('a');
            let link = $a.attr('href');
            if (link.startsWith('..')) {
                link = base_url + link;
            }

            const cacheIn = await cache.get(link);
            if (cacheIn) {
                return JSON.parse(cacheIn);
            }

            const response = await got({
                method: 'get',
                url: link,
            });

            const single = {
                title: $a.text(),
                description: ProcessFeed(response.data),
                link,
            };

            cache.set(link, JSON.stringify(single));
            return single;
        })
    );

    ctx.set('data', {
        title: '中国工业化和信息部',
        link: 'http://www.miit.gov.cn',
        description: '政策文件',
        item: items,
    });
};
