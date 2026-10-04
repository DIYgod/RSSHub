import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const BASE_URL = 'https://www.eurogamer.net';
const ASSET_HOST = 'https://assetsio.gnwcdn.com/';

const CATEGORIES = ['blogs', 'competitions', 'deals', 'features', 'guides', 'interviews', 'news', 'opinions', 'podcasts', 'previews', 'reviews', 'videos'] as const;

const categorySet = new Set<string>(CATEGORIES);

const extractListItems = ($: CheerioAPI, itemSelector: string, linkSelector: string): DataItem[] =>
    $(itemSelector)
        .find(linkSelector)
        .toArray()
        .filter((el) => $(el).attr('href'))
        .map((el) => {
            const a = $(el);
            return {
                title: a.text(),
                link: new URL(a.attr('href')!, BASE_URL).href,
            };
        });

const cleanArticleContent = ($: CheerioAPI): string | undefined => {
    const content = $('.article_body_content');
    if (content.length === 0) {
        return;
    }

    content.prepend($('.headline_image_wrapper'));

    content.find('.gallery').each((_, el) => {
        const gallery = $(el);
        const thumbnails = gallery.find('.thumbnail');
        if (!thumbnails.length) {
            return;
        }
        const figures = thumbnails.toArray().map((thumbnail) => {
            const $thumbnail = $(thumbnail);
            const image = $thumbnail.find('img[data-uri]').removeAttr('style');
            const caption = $thumbnail.attr('data-caption');
            const attribution = $thumbnail.attr('data-attribution');
            const figure = $('<figure>').append(image);
            const description = [caption, attribution ? `Image credit: ${attribution}` : undefined].filter(Boolean).join(' | ');
            if (description) {
                figure.append($('<figcaption>').text(description));
            }
            return figure[0];
        });
        gallery.replaceWith(figures);
    });

    content
        .find(
            '.injection_placeholder, .advert_container, .poll_wrapper, .pagination--hoverable, .loading.spinner, template, .primis_wrapper, .embed_placeholder, .details_overlay, .gallery .details, .gallery .thumbnails-wrapper, .gallery .fullscreen_info, .gallery .button-wrapper'
        )
        .remove();

    content.find('.video-facade').each((_, el) => {
        const facade = $(el).removeAttr('onclick');
        const videoUrl = facade.closest('figure').find('a.video').attr('href');
        if (videoUrl) {
            facade.attr('href', videoUrl);
        }
    });

    content.find('.review_rating').each((_, el) => {
        const $el = $(el);
        const label = $el.attr('aria-label');
        if (label) {
            $el.text(label);
        }
    });

    content.find('img[data-autosize]').each((_, el) => {
        const $img = $(el);
        $img.attr('src', `${ASSET_HOST}${$img.attr('data-uri')}`);
    });
    content.find('noscript').remove();

    content.find('iframe[data-src]').each((_, el) => {
        const $iframe = $(el);
        if (!$iframe.attr('src')) {
            $iframe.attr('src', $iframe.attr('data-src'));
        }
    });

    return content.html() ?? undefined;
};

const parseArticle = async (item: DataItem): Promise<DataItem> => {
    if (!item.link) {
        return item;
    }

    return await cache.tryGet(item.link, async () => {
        const html = await ofetch(item.link!);
        const $ = load(html);

        const pubDateStr = $('meta[property="article:published_time"]').attr('content') ?? $('time[datetime]').attr('datetime');
        const author = $('.byline .author a').text();
        const categories = [
            ...new Set(
                [
                    $('.byline .article_type').text(),
                    ...$('meta[property="article:tag"]')
                        .toArray()
                        .map((el) => $(el).attr('content') ?? ''),
                ]
                    .map((value) => value.trim())
                    .filter(Boolean)
            ),
        ];
        const description = cleanArticleContent($);

        return {
            title: item.title,
            link: item.link,
            description,
            pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
            author,
            category: categories,
        };
    });
};

const handler = async (ctx: Context): Promise<Data> => {
    const category = ctx.req.param('category') ?? '';
    const isLatest = category === '' || category === 'latest';

    if (!isLatest && !categorySet.has(category)) {
        throw new InvalidParameterError(`Unknown Eurogamer category: ${category}. Use one of: ${CATEGORIES.join(', ')}, or omit the parameter for latest.`);
    }

    const currentUrl = isLatest ? `${BASE_URL}/latest` : `${BASE_URL}/${category}`;
    const limit = Number(ctx.req.query('limit') ?? 25);

    const html = await ofetch(currentUrl);
    const $ = load(html);

    const list = extractListItems($, isLatest ? '.blog__item .summary' : 'article.archive__item', isLatest ? 'p.title a' : 'h2.archive__title a').slice(0, limit);
    const items = await Promise.all(list.map((item) => parseArticle(item)));

    return {
        title: $('head title').text(),
        link: currentUrl,
        language: 'en',
        item: items,
    };
};

export const route: Route = {
    path: '/:category?',
    name: 'Articles',
    url: 'www.eurogamer.net/latest',
    maintainers: ['mcdp-adk'],
    handler,
    example: '/eurogamer',
    parameters: {
        category: {
            description: 'Article type. Omit or use `latest` for the latest mix.',
            default: '',
            options: [{ value: 'latest', label: 'Latest' }, ...CATEGORIES.map((slug) => ({ value: slug, label: slug }))],
        },
    },
    description: "Eurogamer's official RSS feeds only include excerpts. This route fetches the full article body from each article page.",
    categories: ['game'],
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
            source: ['www.eurogamer.net/latest'],
            target: '/',
        },
        {
            source: ['www.eurogamer.net/:category'],
            target: '/:category',
        },
    ],
    view: ViewType.Articles,
};
