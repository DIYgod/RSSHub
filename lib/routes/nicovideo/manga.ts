import { load } from 'cheerio';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import proxy from '@/utils/proxy';

export const route: Route = {
    path: '/manga/:id',
    categories: ['anime'],
    example: '/nicovideo/manga/53991',
    parameters: { id: 'ニコニコ漫画中的作品ID，例如 53991（manga.nicovideo.jp/comic/“53991”）' },
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
            source: ['manga.nicovideo.jp/comic/:id'],
            target: '/manga/:id',
        },
        {
            source: ['manga.nicovideo.jp/watch/:id'],
            target: '/manga/:id',
        },
    ],
    name: '漫画详情',
    maintainers: ['xiaobailoves'],

    handler: async (ctx) => {
        const { id } = ctx.req.param();

        const comicUrl = `https://manga.nicovideo.jp/comic/${id}`;
        const rssUrl = `https://manga.nicovideo.jp/rss/manga/${id}`; // The official RSS feed is incomplete; remaining "read in app" chapters may need scraping from the web page

        const [htmlResponse, rssResponse] = await Promise.all([
            cache.tryGet(`nicovideo:manga:${id}:html`, () => ofetch<string>(comicUrl, { responseType: 'text', dispatcher: proxy.dispatcher ?? undefined }), config.cache.routeExpire, false),
            cache.tryGet(`nicovideo:manga:${id}:rss`, () => ofetch<string>(rssUrl, { responseType: 'text', dispatcher: proxy.dispatcher ?? undefined }), config.cache.routeExpire, false),
        ]);

        const $ = load(htmlResponse);
        const $rss = load(rssResponse, { xmlMode: true });

        const dateMap = new Map<string, string>();
        for (const el of $rss('channel > item').toArray()) {
            const $item = $rss(el);
            const link = $item.find('link').text();
            const pubDate = $item.find('pubDate').text();
            if (link) {
                const match = link.match(/\/watch\/mg\d+/);
                if (match) {
                    dateMap.set(match[0], pubDate);
                }
            }
        }

        const mangaTitle = $('.main_title h1').text().trim();
        const author = $('.author h3 span').text().trim();
        const coverImg = $('.main_visual img').attr('src') || '';
        const description = $('.description_text').text().trim();

        const items = $('#episode_list .episode_item')
            .toArray()
            .map((el) => {
                const $el = $(el);

                const titleLink = $el.find('.title a');
                const thumbLink = $el.find('.thumb a');
                const title = titleLink.text().trim() || $el.find('.thumb img').attr('alt') || '';
                const href = titleLink.attr('href') || thumbLink.attr('href') || '';
                if (!href) {
                    return null;
                }
                const fullLink = href.startsWith('http') ? href : `https://manga.nicovideo.jp${href}`;

                const thumb = $el.find('.thumb img').attr('data-original') || $el.find('.thumb img').attr('src') || '';
                const pageCount = $el.find('.mg_status').text().trim();
                const counter = $el.find('.counter').text().trim();

                const pubDateStr = dateMap.get(href);
                const pubDate = pubDateStr ? parseDate(pubDateStr) : undefined;

                let descHtml = '';
                if (thumb) {
                    descHtml += `<p><img src="${thumb}" alt="${title}" /></p>`;
                }
                if (pageCount) {
                    descHtml += `<p>${pageCount}</p>`;
                }
                if (counter) {
                    descHtml += `<p>${counter}</p>`;
                }

                return {
                    title,
                    link: fullLink,
                    pubDate,
                    description: descHtml,
                };
            })
            .filter(Boolean)
            .toReversed(); // Reverse so items without pubDate keep chronological order

        return {
            title: mangaTitle ? `${mangaTitle} - ニコニコ漫画` : $rss('channel > title').text(),
            link: comicUrl,
            description: description || undefined,
            image: coverImg || undefined,
            author: author || undefined,
            item: items,
        };
    },
};
