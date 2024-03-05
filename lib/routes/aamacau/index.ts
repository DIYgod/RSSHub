// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const category = ctx.req.param('category') ?? 'topics';
    const id = ctx.req.param('id') ?? '';

    const rootUrl = 'https://aamacau.com';
    const currentUrl = `${rootUrl}/${category === 'topics' ? 'topics/breakingnews' : `topics/${category}${id ? `/${id}` : ''}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const list = $('post-title a')
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

                content('.cat, .author, .date').remove();

                item.description = content('#contentleft').html();
                item.author = content('meta[itemprop="author"]').attr('content');
                item.pubDate = parseDate(content('meta[property="article:published_time"]').attr('content'));

                return item;
            })
        )
    );

    ctx.set('data', {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    });
};
