import { Route } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/:category{.+}?',
    example: '/wa',
    radar: [
        {
            source: ['abc.net.au/:category*'],
            target: '/:category',
        },
    ],
    parameters: {
        category: 'Category, can be found in the URL, can also be filled in with the `documentId` in the source code of the page, `news/justin` as **Just In** by default',
    },
    name: 'Channel & Topic',
    categories: ['traditional-media'],
    description: `
::: tip
  All Topics in [Topic Library](https://abc.net.au/news/topics) are supported, you can fill in the field after \`topic\` in its URL, or fill in the \`documentId\`.

  For example, the URL for [Computer Science](https://www.abc.net.au/news/topic/computer-science) is \`https://www.abc.net.au/news/topic/computer-science\`, the \`category\` is \`news/topic/computer-science\`, and the \`documentId\` of the Topic is \`2302\`, so the route is [/abc/news/topic/computer-science](https://rsshub.app/abc/news/topic/computer-science) and [/abc/2302](https://rsshub.app/abc/2302).

  The supported channels are all listed in the table below. For other channels, please find the \`documentId\` in the source code of the channel page and fill it in as above.
:::`,
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
};

async function handler(ctx) {
    const { category = 'news/justin' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 30;

    const rootUrl = 'https://www.abc.net.au';
    const apiUrl = new URL('news-web/api/loader/channelrefetch', rootUrl).href;

    let currentUrl = '';
    let documentId;

    if (Number.isNaN(category)) {
        currentUrl = new URL(category, rootUrl).href;
    } else {
        documentId = category;
        const feedUrl = new URL(`news/feed/${documentId}/rss.xml`, rootUrl).href;

        const feedResponse = await ofetch(feedUrl);
        currentUrl = feedResponse.match(/<link>([\w-./:?]+)<\/link>/)[1];
    }

    const currentResponse = await ofetch(currentUrl);

    const $ = load(currentResponse);

    documentId = documentId ?? $('div[data-uri^="coremedia://collection/"]').first().prop('data-uri').split(/\//).pop();

    const response = await ofetch(apiUrl, {
        query: {
            name: 'PaginationArticles',
            documentId,
            size: limit,
        },
    });

    let items = response.collection.slice(0, limit).map((i) => {
        const item = {
            title: i.title.children ?? i.title,
            link: i.link.startsWith('https://') ? i.link : new URL(i.link, rootUrl).href,
            description: art(path.join(__dirname, 'templates/description.art'), {
                image: i.image
                    ? {
                          src: i.image.imgSrc.split(/\?/)[0],
                          alt: i.image.alt,
                      }
                    : undefined,
            }),
            author: i.newsBylineProps?.authors?.map((a) => a.name).join('/') ?? undefined,
            guid: `abc-${i.id}`,
            pubDate: parseDate(i.dates.firstPublished),
            updated: i.dates.lastUpdated ? parseDate(i.dates.lastUpdated) : undefined,
        };

        if (i.mediaIndicator) {
            item.enclosure_type = 'audio/mpeg';
            item.itunes_item_image = i.image?.imgSrc.split(/\?/)[0] ?? undefined;
            item.itunes_duration = i.mediaIndicator.duration;
        }

        return item;
    });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const detailResponse = await ofetch(item.link);

                    const content = load(detailResponse);

                    content('aside, header, [data-print="inline-media"], [data-component="EmbedBlock"]').remove();

                    content('#body *, div[data-component="FeatureMedia"]')
                        .children()
                        .each(function () {
                            const element = content(this);
                            if (element.prop('tagName').toLowerCase() === 'figure') {
                                element.replaceWith(
                                    art(path.join(__dirname, 'templates/description.art'), {
                                        image: {
                                            src: element.find('img').prop('src').split(/\?/)[0],
                                            alt: element.find('figcaption').text().trim(),
                                        },
                                    })
                                );
                            } else {
                                element.removeAttr('id class role data-component data-uri');
                            }
                        });

                    item.title = content('meta[property="og:title"]').prop('content');
                    item.description = '';

                    const enclosurePattern = String.raw`"(?:MIME|content)?Type":"([\w]+/[\w]+)".*?"(?:fileS|s)?ize":(\d+),.*?"url":"([\w-.:/?]+)"`;

                    const enclosureMatches = detailResponse.match(new RegExp(enclosurePattern, 'g'));

                    if (enclosureMatches) {
                        const enclosureMatch = enclosureMatches
                            .map((e) => e.match(new RegExp(enclosurePattern)))
                            .sort((a, b) => Number.parseInt(a[2], 10) - Number.parseInt(b[2], 10))
                            .pop();

                        item.enclosure_url = enclosureMatch[3];
                        item.enclosure_length = enclosureMatch[2];
                        item.enclosure_type = enclosureMatch[1];

                        item.description = art(path.join(__dirname, 'templates/description.art'), {
                            enclosure: {
                                src: item.enclosure_url,
                                type: item.enclosure_type,
                            },
                        });
                    }

                    item.description =
                        art(path.join(__dirname, 'templates/description.art'), {
                            description: (content('div[data-component="FeatureMedia"]').html() || '') + (content('#body div[data-component="LayoutContainer"] div').first().html() || ''),
                        }) + item.description;

                    item.category = content('meta[property="article:tag"]')
                        .toArray()
                        .flatMap((c) =>
                            content(c)
                                .prop('content')
                                .split(/，/)
                                .map((c) => c.trim())
                        );
                    item.guid = `abc-${content('meta[name="ContentId"]').prop('content')}`;
                    item.pubDate = parseDate(content('meta[property="article:published_time"]').prop('content'));
                    item.updated = parseDate(content('meta[property="article:modified_time"]').prop('content'));
                } catch {
                    //
                }

                return item;
            })
        )
    );

    const icon = new URL($('link[rel="apple-touch-icon"]').prop('href') || '', rootUrl).href;

    return {
        item: items,
        title: $('title').first().text(),
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content').split('?')[0],
        icon,
        logo: icon,
        subtitle: $('meta[property="og:title"]').prop('content'),
        author: $('meta[name="generator"]').prop('content'),
        allowEmpty: true,
    };
}
