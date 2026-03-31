import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    example: '/gameapps',
    radar: [
        {
            source: ['gameapps.hk/'],
        },
    ],
    name: '最新消息',
    maintainers: ['TonyRL'],
    handler,
    url: 'gameapps.hk/',
};

async function handler() {
    const baseUrl = 'https://www.gameapps.hk';
    const feed = await parser.parseURL(`${baseUrl}/rss`);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link, {
                    headers: {
                        Referer: baseUrl,
                    },
                });
                const $ = load(response);

                item.title = $('meta[property="og:title"]').attr('content') ?? $('.news-title h1').text();

                $('.pages').remove();

                // remove unwanted key value
                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;

                const intro = $('div.introduction.media.news-intro div.media-body').html()?.trim();
                const desc = $('.article-content').html()?.trim();
                item.description = renderToString(
                    <>
                        {intro ? raw(intro) : null}
                        {desc ? raw(desc) : null}
                    </>
                );
                item.guid = item.guid.slice(0, item.link.lastIndexOf('/'));
                item.pubDate = parseDate(item.pubDate);
                item.enclosure_url = $('div.introduction.media.news-intro div.media-left').find('img').attr('src');
                item.enclosure_type = 'image/jpeg';

                return item;
            })
        )
    );

    return {
        title: feed.title,
        link: feed.link,
        description: feed.description,
        image: `${baseUrl}/static/favicon/apple-touch-icon.png`,
        item: items,
        language: feed.language,
    };
}
