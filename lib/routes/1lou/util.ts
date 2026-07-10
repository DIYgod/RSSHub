import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const rootUrl = 'https://www.1lou.me';

// A 1lou list page — forum listing or search results — is the same `li.media.thread.tap` markup.
// Fetch it, take the newest `limit` threads, then hydrate each from its detail page (torrent
// enclosure, body, cover). Returned `$` lets callers read page-level fields (title, logo).
export async function fetchThreads(currentUrl: string, limit: number) {
    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const language = $('html').prop('lang');

    let items = $('li.media.thread.tap:not(li.hidden-sm)')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const subjectEl = item.find('div.subject').children('a').first();

            return {
                title: subjectEl.text(),
                pubDate: timezone(parseDate(item.find('span.date').text()), +8),
                link: new URL(subjectEl.prop('href'), rootUrl).href,
                category: [
                    item.find('a.text-secondary').text().replaceAll('[]', ''),
                    ...item
                        .find('a.badge')
                        .toArray()
                        .map((c) => $(c).text()),
                ].filter(Boolean),
                author: item.find('a.username').text(),
                language,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h4.break-all').contents().last().text();

                if (title) {
                    const description = $$('div.message.break-all').html();
                    const image = new URL($$('img').first().prop('src'), rootUrl).href;

                    item.title = title;
                    item.description = description;
                    item.pubDate = timezone(parseDate($$('span.date').text()), +8);
                    item.category = $$('a.badge')
                        .toArray()
                        .map((c) => $$(c).text());
                    item.content = {
                        html: description,
                        text: $$('div.message.break-all').text(),
                    };
                    item.image = image;
                    item.banner = image;
                    item.language = language;

                    const torrents = $$('ul.attachlist li a');

                    if (torrents.length > 0) {
                        const torrent = torrents.first();

                        item.enclosure_url = new URL(torrent.prop('href'), rootUrl).href;
                        item.enclosure_type = 'application/x-bittorrent';
                        item.enclosure_title = torrent.text();
                    }
                }

                return item;
            })
        )
    );

    return { $, items, language };
}
