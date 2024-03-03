// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const rootUrl = 'https://photo.cctv.com';
    const currentUrl = `${rootUrl}/jx/`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('.textr a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                const date = content('head')
                    .html()
                    .match(/publishDate ="(.*) ";/)[1];
                item.pubDate = date ? parseDate(date, 'YYYYMMDDHHmmss') : null;

                item.description = content('.tujitop').html();

                return item;
            })
        )
    );

    ctx.set('data', {
        title: '央视网图片《镜象》',
        link: currentUrl,
        item: items,
    });
};
