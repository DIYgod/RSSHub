import { Route } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

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

                const nextPages = $('.pagination li')
                    .not('.disabled')
                    .not('.active')
                    .find('a')
                    .toArray()
                    .map((a) => `${baseUrl}${a.attribs.href}`);

                $('.pages').remove();

                const content = $('.news-content');

                // remove unwanted key value
                delete item.content;
                delete item.contentSnippet;
                delete item.isoDate;

                if (nextPages.length) {
                    const pages = await Promise.all(
                        nextPages.map(async (url) => {
                            const response = await ofetch(url, {
                                headers: {
                                    referer: item.link,
                                },
                            });
                            const $ = load(response);
                            $('.pages').remove();
                            return $('.news-content').html();
                        })
                    );
                    content.append(pages);
                }

                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    intro: $('div.introduction.media.news-intro div.media-body').html()?.trim(),
                    desc: content.html()?.trim(),
                });
                item.guid = item.guid.substring(0, item.link.lastIndexOf('/'));
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
