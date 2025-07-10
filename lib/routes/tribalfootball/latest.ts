import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { art } from '@/utils/render';
import path from 'node:path';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const rssUrl = 'https://www.tribalfootball.com/rss/mediafed/general/rss.xml';

export const route: Route = {
    path: '/',
    radar: [
        {
            source: ['tribalfootball.com/'],
            target: '',
        },
    ],
    name: 'Unknown',
    maintainers: ['Rongronggg9'],
    handler,
    url: 'tribalfootball.com/',
};

async function handler() {
    const rss = await got(rssUrl);
    const $ = load(rss.data, { xmlMode: true });
    const items = $('rss > channel > item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            let link = $item.find('link').text();
            link = new URL(link);
            link.search = '';
            link = link.href;
            return {
                title: $item.find('title').text(),
                description: $item.find('description').text(),
                link,
                guid: $item.find('guid').text(),
                pubDate: parseDate($item.find('pubDate').text()),
                author: $item.find(String.raw`dc\:creator`).text(),
                _header_image: $item.find('enclosure').attr('url'),
            };
        });

    await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                const title = $('head > title').text().replace(' - Tribal Football', '');

                let desc = $('.articleBody');
                desc.find('.ad').remove();
                // <p><br><i>AD</i><span></span></p>
                const ad = desc.find('p > br:first-child').next('i');
                const adNextSpan = ad.next('span');
                if (adNextSpan.length && !adNextSpan.text() && !adNextSpan.next().length) {
                    ad.parent().remove();
                }
                desc = desc.html();
                desc = art(path.join(__dirname, 'templates/plus_header.art'), {
                    desc,
                    header_image: item._header_image,
                });

                item.title = title || item.title;
                item.description = desc || item.description;
                delete item._header_image;
                return item;
            })
        )
    );

    return {
        title: 'Tribal Football - Latest',
        description: 'Tribal Football - Football News, Soccer News, Transfers & Rumours',
        link: 'https://www.tribalfootball.com/articles',
        image: 'https://www.tribalfootball.com/images/tribal-logo-rss.png',
        item: items,
    };
}
