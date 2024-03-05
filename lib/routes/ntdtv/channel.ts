// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const host = 'https://www.ntdtv.com';

export default async (ctx) => {
    const language = ctx.req.param('language');
    const id = ctx.req.param('id');
    const url = `${host}/${language}/${id}`;

    const response = await got(url);
    const $ = load(response.data);
    const title = $('h1.block_title').text();
    const list = $('div.list_wrapper > div')
        .map((_, item) => ({
            title: $(item).find('div.title').text(),
            link: $(item).find('div.title > a').attr('href'),
            description: $(item).find('div.excerpt').text(),
        }))
        .get()
        .filter((item) => item.link);

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got.get(item.link);
                const content = load(detailResponse.data);

                item.description = content('div.post_content').html();
                item.pubDate = timezone(parseDate(content('div.time > span').text()), +8);

                return item;
            })
        )
    );

    ctx.set('data', {
        title: `新唐人电视台 - ${title}`,
        link: url,
        item: items,
    });
};
