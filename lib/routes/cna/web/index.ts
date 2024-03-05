// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const id = ctx.req.param('id') || 'aall';

    const rootUrl = /^\d+$/.test(id) ? `https://www.cna.com.tw/topic/newstopic/${id}.aspx` : `https://www.cna.com.tw/list/${id}.aspx`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = load(response.data);
    const list = $('*:is(.pcBox .caItem, .mainList li a div) h2')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: new URL(item.parents('a').attr('href'), 'https://www.cna.com.tw').href,
                pubDate: timezone(parseDate(item.next().text()), +8),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                const topImage = content('.fullPic').html();

                item.description = (topImage === null ? '' : topImage) + content('.paragraph').eq(0).html();
                item.category = [
                    ...content("meta[property='article:tag']")
                        .get()
                        .map((e) => e.attribs.content),
                    content('.active > a').text(),
                ];

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: rootUrl,
        item: items,
    });
};
