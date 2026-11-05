import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://www.stheadline.com';

export const route: Route = {
    path: '/std/:category{.+}?',
    name: '即時',
    maintainers: ['TonyRL'],
    example: '/stheadline/std/realtimenews',
    parameters: { category: '分類路徑，URL 中 `www.stheadline.com/` 後至中文分類名前部分，預設為 `realtimenews`' },
    radar: [
        {
            source: ['www.stheadline.com/theme/:category/chineseCategory', 'www.stheadline.com/:category/:chineseCategory'],
            target: '/std/:category',
        },
    ],
    handler,
};

async function handler(ctx) {
    const { category = 'realtimenews' } = ctx.req.param();
    const url = `${baseUrl}/${category}`;
    const { data: response } = await got(url);
    const $ = load(response);

    let items: Array<DataItem & { link: string }> = $('.news-block .news-detail > a')
        .toArray()
        .map((item) => {
            const $item = $(item);
            return {
                title: $item.find('.title').text(),
                link: new URL($item.attr('href')!, 'https://www.stheadline.com').href,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`stheadline:article:v6:${item.link}`, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                const published = $('meta[property="article:published_time"]').attr('content');
                const modified = $('meta[property="article:modified_time"]').attr('content');
                const author = getArticleByline($) || $('meta[name="dable:author"]').attr('content');

                return {
                    description: getArticleContent($, response),
                    author,
                    pubDate: published ? parseDate(published) : undefined,
                    updated: modified ? parseDate(modified) : undefined,
                    category: $("meta[name='keyword']").attr('content')?.split(','),
                };
            });
            return { ...item, ...detail, guid: item.link.slice(0, item.link.lastIndexOf('/')) };
        },
        { concurrency: 3 }
    );

    return {
        title: $('head meta[name="title"]').attr('content') || $('head title').text(),
        description: $('meta[name=description]').attr('content'),
        image: 'https://www.sthlstatic.com/sthl/assets/favicon/android-icon-192x192.png',
        language: 'zh-HK' as const,
        link: url,
        item: items,
    };
}

interface GalleryImage {
    src: string;
    srcset?: string;
    alt_text?: string;
    caption?: string;
}

function getArticleContent($: CheerioAPI, response: string) {
    const content = $('.content-body');
    const galleryData = response.match(/const article_galleries\s*=\s*(\{[^\n]+\});/);
    const galleries: Record<string, GalleryImage[]> = galleryData ? JSON.parse(galleryData[1]) : {};
    for (const [key, images] of Object.entries(galleries)) {
        const figure = $('<figure>');
        for (const image of images) {
            const imageFigure = $('<figure>').append(
                $('<img>')
                    .attr('src', image.src)
                    .attr('alt', image.alt_text ?? '')
            );
            if (image.srcset) {
                imageFigure.find('img').attr('srcset', image.srcset);
            }
            if (image.caption) {
                imageFigure.append($('<figcaption>').text(image.caption));
            }
            figure.append(imageFigure);
        }
        content.find(key).replaceWith(figure);
    }
    const article = $('.main-column > article');
    const media = article.children('figure').add(article.children('[id^="videoplayer"]').find('video'));
    return (
        media
            .toArray()
            .map((element) => $.html(element))
            .join('') + (content.html() ?? '')
    );
}

function getArticleByline($: CheerioAPI) {
    const credits: string[] = [];
    for (const paragraph of $('.content-body p').toArray().toReversed()) {
        const text = $(paragraph).text().trim();
        if (!/^(?:記者(?:[/／]攝影)?[：:\s]|攝影[：:\s]|本報記者$)/.test(text) || $(paragraph).find('a, img, video').length) {
            break;
        }
        credits.unshift(text);
        $(paragraph).remove();
    }
    return credits.join('；');
}
