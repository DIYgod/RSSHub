// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.soundofhope.org';

export default async (ctx) => {
    const channel = ctx.req.param('channel');
    const id = ctx.req.param('id');
    const url = `${host}/${channel}/${id}`;

    const response = await got(url);
    const $ = load(response.data);
    const title = $('div.left > nav').text().split('/').slice(1).join('');
    const list = $('div.item')
        .map((_, item) => ({
            title: $(item).find('div.title').text(),
            link: new URL($(item).find('a').attr('href'), host).href,
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.description = content('div.Content__Wrapper-sc-1bvya0-0').html();
                item.pubDate = timezone(parseDate(content('div.date').text(), 'YYYY.M.D HH:mm'), -8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `希望之声 - ${title}`,
        link: url,
        item: items,
    });
};
