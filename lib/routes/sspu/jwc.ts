// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const listId = ctx.req.param('listId');
    const baseUrl = 'https://jwc.sspu.edu.cn';

    const { data: response, url: link } = await got(`${baseUrl}/${listId}/list.htm`);
    const $ = load(response);

    const list = $('.news_list .news')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 15)
        .toArray()
        .map((item) => {
            item = $(item);
            const title = item.find('.news_title a');
            return {
                title: title.attr('title'),
                link: `${baseUrl}${title.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                item.description = $('.wp_articlecontent').html();
                item.pubDate = timezone(parseDate($('.arti_update').text(), 'YYYY-MM-DD HH:mm:ss'), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('head title').text(),
        link,
        item: items,
    });
};
