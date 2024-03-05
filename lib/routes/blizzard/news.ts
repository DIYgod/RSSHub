// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

export default async (ctx) => {
    const category = ctx.req.param('category') || '';
    const language = ctx.req.param('language') || 'en-us';

    const rootUrl = 'https://news.blizzard.com';
    const currentUrl = `${rootUrl}/${language}/${category}`;
    const apiUrl = `${rootUrl}/${language}/blog/list`;
    const response = await got(apiUrl, {
        searchParams: {
            community: category === '' ? 'all' : category,
        },
    });

    const $ = load(response.data.html, null, false);

    const list = $('.FeaturedArticle-text > a, .ArticleListItem > article > a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}${item.attr('href')}`,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.author = content('.ArticleDetail-bylineAuthor').text();
                item.description = content('.ArticleDetail-headingImageBlock').html() + content('.ArticleDetail-content').html();
                item.pubDate = content('.ArticleDetail-subHeadingLeft time').attr('timestamp');

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
