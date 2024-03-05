// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
const { nwafuMap } = require('./utils');

export default async (ctx) => {
    const { type = 'jiaowu' } = ctx.req.param();
    const response = await got.get(nwafuMap.get(type)[0]);
    const $ = load(response.data);
    const list = $(nwafuMap.get(type)[1])
        .map((index, ele) => {
            const itemTitle = $(ele).find(nwafuMap.get(type)[2]).text();
            const itemPubDate = parseDate($(ele).find('span').text(), 'YYYY/MM/DD');
            const itemLink = new URL($(ele).find(nwafuMap.get(type)[2]).attr('href'), nwafuMap.get(type)[0]).toString();
            return {
                title: itemTitle,
                pubDate: itemPubDate,
                link: itemLink,
            };
        })
        .get();

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (nwafuMap.get('forbiddenList').includes(new URL(item.link).hostname)) {
                    return item;
                }
                const detailResponse = await got.get(item.link);
                const $ = load(detailResponse.data);
                item.description = $(nwafuMap.get(type)[3]).html();
                return item;
            })
        )
    );

    ctx.set('data', {
        title: nwafuMap.get(type)[4],
        link: nwafuMap.get(type)[0],
        description: nwafuMap.get(type)[4],
        item: out,
    });
};
