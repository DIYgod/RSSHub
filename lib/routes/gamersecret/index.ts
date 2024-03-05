// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const type = ctx.req.param('type') ?? 'latest-news';
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://www.gamersecret.com';
    const currentUrl = `${rootUrl}/${type}${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.jeg_post_title a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
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

                content('img').each(function () {
                    content(this).attr('src', content(this).attr('data-src'));
                });

                item.author = content('.jeg_meta_author').text().replace(/by/, '');
                item.pubDate = timezone(parseDate(detailResponse.data.match(/datePublished":"(.*)","dateModified/)[1]), +8);
                item.description = content('.thumbnail-container').html() + content('.elementor-text-editor, .content-inner').html();

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
