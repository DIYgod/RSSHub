// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const rootUrl = 'https://qqorw.cn';
    const currentUrl = new URL(category, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('article.excerpt')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('h2 a');

            return {
                title: a.text(),
                link: a.prop('href'),
                description: item.find('span.note').text(),
                category: item
                    .find('a.label')
                    .toArray()
                    .map((c) => $(c).text()),
                pubDate: timezone(parseDate(item.find('p.auth-span span.muted').first().text().trim()), +8),
                upvotes: item.find('span.count').text() ? Number.parseInt(item.find('span.count').text(), 10) : 0,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('div.contenttxt').prev().nextAll().remove();

                item.title = content('h1.article-title').text();
                item.description = content('article.article-content').html();
                item.author = content('i.fa-user').parent().text().trim();
                item.category = content('#mute-category')
                    .toArray()
                    .map((c) => content(c).text().trim());
                item.pubDate = item.pubDate ?? parseDate(content('i.fa-clock-o').parent().text().trim());
                item.upvotes = content('#Addlike span.count').text() ? Number.parseInt(content('#Addlike span.count').text(), 10) : item.upvotes;

                return item;
            })
        )
    );

    const author = '早报网';
    const icon = new URL('favicon.ico', rootUrl).href;
    const title = $('header.archive-header h1 a').last().text();

    ctx.set('data', {
        item: items,
        title: `${author}${title ? ` - ${title}` : ''}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh-cn',
        image: new URL($('h1.site-title a img').prop('src'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
    });
};
