import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/apod',
    categories: ['picture'],
    view: ViewType.Pictures,
    example: '/nasa/apod',
    parameters: {},
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
            source: ['science.nasa.gov/apod/*', 'apod.nasa.gov/apod/*'],
        },
    ],
    name: 'Astronomy Picture of the Day',
    maintainers: ['nczitzk', 'williamgateszhao'],
    handler,
    url: 'science.nasa.gov/apod/',
};

async function handler(ctx) {
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 10;
    const rootUrl = 'https://science.nasa.gov/apod/archive/';
    const response = await ofetch('https://science.nasa.gov/feed/apod-basic/', { responseType: 'text' });
    const $ = load(response, { xml: true });
    const imageStyle = 'display: block; width: auto; max-width: 100%; height: auto; margin: 0 auto;';

    const items = $('channel > item')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const item = $(el);
            const content = load(item.find(String.raw`content\:encoded`).text());
            const media = content('body img, body video, body iframe').first();
            const hdUrl = item.find(String.raw`apod\:hdurl`).text();

            if (media.is('img')) {
                media.removeAttr('width').removeAttr('height').attr('style', imageStyle);
            }

            let mediaHtml = media.prop('outerHTML') || '';

            if (media.is('img') && media.parent().is('a')) {
                mediaHtml = media.parent().prop('outerHTML') || mediaHtml;
            }

            // Some entries omit the image from their HTML but provide its URL.
            if (!mediaHtml && hdUrl) {
                mediaHtml = content('<a>')
                    .attr('href', hdUrl)
                    .append(content('<img>').attr({ src: hdUrl, alt: item.find(String.raw`apod\:alt`).text(), style: imageStyle }))
                    .prop('outerHTML')!;
            }

            const explanation = item.find(String.raw`apod\:explanation`).text() || item.find('description').text();
            const credit = item.find(String.raw`apod\:credit`).text() || item.find(String.raw`apod\:copyright`).text();
            const pubDate = item.find('pubDate').text();

            return {
                title: item.find('title').text(),
                link: item.find('link').text(),
                description: `${mediaHtml}<p>${explanation}</p>${credit ? `<p><strong>Credit:</strong> ${credit}</p>` : ''}`,
                pubDate: pubDate ? parseDate(pubDate) : undefined,
            };
        });

    return {
        title: 'NASA Astronomy Picture of the Day',
        link: rootUrl,
        item: items,
    };
}
