import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

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
                    item.description = renderDescription({
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

const renderDescription = ({
    image,
    intro,
    video,
    description,
}: {
    image?: { src?: string; alt?: string; width?: string; height?: string };
    intro?: string;
    video?: { src?: string; poster?: string; type?: string };
    description?: string;
}): string => {
    const imageAlt = image?.height ?? image?.width ?? image?.alt;
    const videoPoster = video?.poster ?? image?.src;

    return renderToString(
        <>
            {!video?.src && image?.src ? (
                <figure>
                    <img src={image.src} alt={imageAlt} />
                </figure>
            ) : null}
            {intro ? <p>{intro}</p> : null}
            {video?.src ? (
                <video poster={videoPoster} controls>
                    <source src={video.src} type={video.type} />
                    <object data={video.src}>
                        <embed src={video.src} />
                    </object>
                </video>
            ) : null}
            {description ? <>{raw(description)}</> : null}
        </>
    );
};
