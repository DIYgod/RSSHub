import { load } from 'cheerio';

import cache from '@/utils/cache';
import got from '@/utils/got';

const rootUrl = 'https://www.1lou.me';

export const parseItems = async (items, language) =>
    await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const $$ = load(detailResponse);

                const title = $$('h4.break-all').contents().last().text();

                if (title) {
                    const description = $$('div.message.break-all').html();
                    const image = new URL($$('img').first().prop('src')!, rootUrl).href;

                    item.title = title;
                    item.description = description;
                    // No parsing item.pubDate because it may match the date in comments
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

                        item.enclosure_url = new URL(torrent.prop('href')!, rootUrl).href;
                        item.enclosure_type = 'application/x-bittorrent';
                        item.enclosure_title = torrent.text();
                    }
                }

                return item;
            })
        )
    );
