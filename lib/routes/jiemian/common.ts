import { Data } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const handler = async (ctx): Promise<Data> => {
    const { category = '' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://www.jiemian.com';
    const currentUrl = new URL(category ? `${category}.html` : '', rootUrl).href;

    const response = await ofetch(currentUrl);

    const $ = load(response);

    let items = {};
    const links = $('a').toArray();
    for (const el of links) {
        const item = $(el);
        const href = item.prop('href');
        const link = href ? (href.startsWith('/') ? new URL(href, rootUrl).href : href) : undefined;

        if (link && /\/(article|video)\/\w+\.html/.test(link)) {
            items[link] = {
                title: item.text(),
                link,
            };
        }
    }

    items = await Promise.all(
        Object.values(items)
            .slice(0, limit)
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResponse = await ofetch(item.link);

                    const content = load(detailResponse);
                    const image = content('div.article-img img').first();
                    const video = content('#video-player').first();

                    item.title = content('div.article-header h1').eq(0).text();
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        image: image
                            ? {
                                  src: image.prop('src'),
                                  alt: image.next('p').text() || item.title,
                              }
                            : undefined,
                        video: video
                            ? {
                                  src: video.prop('data-url'),
                                  poster: video.prop('data-poster'),
                                  width: video.prop('width'),
                                  height: video.prop('height'),
                              }
                            : undefined,
                        intro: content('div.article-header p').text(),
                        description: content('div.article-content').html(),
                    });
                    item.author = content('span.author')
                        .first()
                        .find('a')
                        .toArray()
                        .map((a) => content(a).text())
                        .join('/');
                    item.category = content('meta.meta-container a')
                        .toArray()
                        .map((c) => content(c).text());
                    item.pubDate = parseDate(content('div.article-info span[data-article-publish-time]').prop('data-article-publish-time'), 'X');
                    item.upvotes = content('span.opt-praise__count').text() ? Number.parseInt(content('span.opt-praise__count').text(), 10) : 0;
                    item.comments = content('span.opt-comment__count').text() ? Number.parseInt(content('span.opt-comment__count').text(), 10) : 0;

                    return item;
                })
            )
    );

    const title = $('title').text();
    const titleSplits = title.split(/_/);
    const image = $('div.logo img').prop('src');
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image,
        icon,
        logo: icon,
        subtitle: titleSplits[0],
        author: titleSplits.pop(),
    };
};
