import { load } from 'cheerio';
import { raw } from 'hono/html';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rssUrl = 'https://www.tribalfootball.com/rss/mediafed/general/rss.xml';

const renderDescription = (desc, headerImage) =>
    renderToString(
        <>
            {headerImage ? (
                <p>
                    <img src={headerImage} />
                </p>
            ) : null}
            {desc ? <>{raw(desc)}</> : null}
        </>
    );

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/tribalfootball',
    radar: [
        {
            source: ['tribalfootball.com/'],
            target: '',
        },
    ],
    name: 'Latest News',
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
            const linkUrl = new URL($item.find('link').text());
            linkUrl.search = '';
            return {
                title: $item.find('title').text(),
                description: $item.find('description').text(),
                link: linkUrl.href,
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

                const desc = $('.articleBody');
                desc.find('.ad').remove();
                // <p><br><i>AD</i><span></span></p>
                const ad = desc.find('p > br:first-child').next('i');
                const adNextSpan = ad.next('span');
                if (adNextSpan.length && !adNextSpan.text() && !adNextSpan.next().length) {
                    ad.parent().remove();
                }
                const rendered = renderDescription(desc.html(), item._header_image);

                item.title = title || item.title;
                item.description = rendered || item.description;
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
