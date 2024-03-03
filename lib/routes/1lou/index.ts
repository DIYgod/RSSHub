// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const path = ctx.req.param('path') ?? '';
    const rootUrl = `https://www.1lou.me`;
    const currentUrl = `${rootUrl}/${path}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);

    let items = $('li.media.thread.tap:not(.hidden-sm)')
        .toArray()
        .map((item) => {
            const title = $(item).find('.subject.break-all').children('a').first();
            const author = $(item).find('.username.text-grey.mr-1').text();
            const pubDate = $(item).find('.date.text-grey').text();
            return {
                title: title.text(),
                link: `${rootUrl}/${title.attr('href')}`,
                author,
                pubDate: timezone(parseDate(pubDate), +8),
            };
        });
    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = load(detailResponse.data);
                item.description = content('.message.break-all').html();
                const torrents = content('.attachlist').find('a');
                if (torrents.length > 0) {
                    item.enclosure_type = 'application/x-bittorrent';
                    item.enclosure_url = `${rootUrl}/${torrents.first().attr('href')}`;
                }

                return item;
            })
        )
    );
    ctx.set('data', {
        title: '1Lou',
        link: currentUrl,
        item: items,
    });
};
