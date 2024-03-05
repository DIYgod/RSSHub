// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const day = ctx.req.param('day') ?? 'all';
    const link = `https://post.smzdm.com/hot_${day}/`;

    const response = await got(link);
    const $ = load(response.data);
    const title = $('li.filter-tab.active').text();

    const list = $('li.feed-row-wide')
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('h5.z-feed-title a').text(),
                link: item.find('h5.z-feed-title a').attr('href'),
                pubDate: timezone(parseDate(item.find('span.z-publish-time').text()), 8),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const content = $('#articleId');
                content.find('.item-name').remove();
                content.find('.recommend-tab').remove();

                item.description = content.html();
                item.pubDate = timezone(parseDate($('meta[property="og:release_date"]').attr('content')), 8);
                item.author = $('meta[property="og:author"]').attr('content');

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `${title}-什么值得买好文`,
        link,
        item: out,
    });
};
