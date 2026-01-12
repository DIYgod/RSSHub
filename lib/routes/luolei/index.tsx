import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

type DescriptionImage = {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
};

type DescriptionVideo = {
    src?: string;
};

const renderDescription = ({ images, videos }: { images?: DescriptionImage[]; videos?: DescriptionVideo[] }) =>
    renderToString(
        <>
            {images?.length
                ? images.map((image) => {
                      if (videos?.[0]?.src || !image?.src) {
                          return null;
                      }

                      const alt = image.height ?? image.width ?? image.alt;
                      return <figure>{alt ? <img src={image.src} alt={alt} /> : <img src={image.src} />}</figure>;
                  })
                : null}
        </>
    );

const unblurImages = ($: CheerioAPI) => {
    $('img[data-original-src]').each((_, el) => {
        el = $(el);

        el.replaceWith(
            renderDescription({
                images: [
                    {
                        src: el.prop('data-original-src'),
                    },
                ],
            })
        );
    });

    return $;
};

export const handler = async (ctx) => {
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://luolei.org';

    const { data: response } = await got(rootUrl);

    const $ = load(response);

    const language = $('html').prop('lang');
    const themeEl = $('link[rel="modulepreload"]')
        .toArray()
        .findLast((l) => /theme\..*\.js$/.test($(l).prop('href')));
    const themeUrl = themeEl ? new URL($(themeEl).prop('href'), rootUrl).href : undefined;

    const { data: themeResponse } = await got(themeUrl);

    let items = themeResponse
        .match(/{"title":".*?"string":".*?"}}/g)
        .slice(0, limit)
        .map((item) => {
            item = JSON.parse(
                item
                    .replaceAll(String.raw`\\"`, String.raw`\"`)
                    .replaceAll(String.raw`\\n`, '')
                    .replaceAll('\\`', '`')
            );

            const $$ = unblurImages(load(item.excerpt));

            const title = item.title;
            const description = $$.html();
            const image = item.cover;

            return {
                title,
                description,
                pubDate: parseDate(item.date.time, 'x'),
                link: new URL(item.url, rootUrl).href,
                category: item.categories,
                author: item.author,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.description.length > 40) {
                    return item;
                }

                const { data: detailResponse } = await got(item.link);

                const $$ = unblurImages(load(detailResponse));

                $$('div.tweet-card').remove();

                const title = $$('h2').first().text();
                const description = $$('div.vp-doc').html();

                item.title = title;
                item.description = description;
                item.content = {
                    html: description,
                    text: $$('div.vp-doc').text(),
                };
                item.language = language;

                return item;
            })
        )
    );

    const image = new URL($('img.logo').prop('src'), rootUrl).href;

    return {
        title: $('title').first().text(),
        description: $('meta[name="description"]').prop('content'),
        link: rootUrl,
        item: items,
        allowEmpty: true,
        image,
        author: $('meta[property="og:title"]').prop('content'),
        language,
    };
};

export const route: Route = {
    path: '/',
    name: '罗磊的独立博客',
    url: 'luolei.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/luolei',
    description: '',
    categories: ['blog'],

    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['luolei.org'],
            target: '/',
        },
    ],
};
