import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.jiemian.com';
const currentUrl = `${rootUrl}/lists/1324kb.html`;

export const route: Route = {
    path: '/kuaibao-hot',
    name: '\u5feb\u62a5\u70ed\u70b9',
    example: '/jiemian/kuaibao-hot',
    maintainers: ['maxlixiang'],
    handler,
    categories: ['traditional-media'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.jiemian.com/lists/1324kb.html'],
            target: '/kuaibao-hot',
        },
    ],
};

async function handler(ctx): Promise<Data> {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;
    const response = await ofetch(currentUrl);
    const $ = load(response);
    const container = $('#lists').length ? $('#lists') : $('body');

    let items = {};
    for (const el of container.find('a').toArray()) {
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

                    content('p.report-view').remove();

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

                    return item;
                })
            )
    );

    const title = $('title').text();
    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang'),
        image: icon,
        icon,
        logo: icon,
        author: title.split(/_/).pop(),
    };
}

const renderDescription = ({
    image,
    intro,
    video,
    description,
}: {
    image?: { src?: string; alt?: string };
    intro?: string;
    video?: { src?: string; poster?: string; type?: string };
    description?: string;
}): string => {
    const videoPoster = video?.poster ?? image?.src;
    const parts: string[] = [];

    if (!video?.src && image?.src) {
        parts.push(`<figure><img src="${image.src}" alt="${image.alt ?? ''}"></figure>`);
    }

    if (intro) {
        parts.push(`<p>${intro}</p>`);
    }

    if (video?.src) {
        parts.push(`<video poster="${videoPoster ?? ''}" controls><source src="${video.src}" type="${video.type ?? ''}"><object data="${video.src}"><embed src="${video.src}"></object></video>`);
    }

    if (description) {
        parts.push(description);
    }

    return parts.join('');
};
