import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/gb/offer',
    categories: ['shopping'],
    example: '/ikea/gb/offer',
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
            source: ['ikea.com/gb/en/offers', 'ikea.com/'],
        },
    ],
    name: 'UK - Offers',
    maintainers: ['HenryQW'],
    handler,
    url: 'ikea.com/gb/en/offers',
};

async function handler() {
    const link = 'https://www.ikea.com/gb/en/offers/';
    const response = await got(link);

    const $ = load(response.data);
    const carousel = $('.pub__carousel-slide')
        .toArray()
        .map((e) => {
            e = $(e);
            const title = e.find('h3');
            const img = e.find('.pub__image').each((_, e) => {
                e.attribs.src = e.attribs.src.split('?')[0];
                delete e.attribs.srcset;
            });
            const link = new URL(e.find('pub-hide-empty-link a').attr('href'));
            const { searchParams, href } = link;
            searchParams.delete('itm_content');
            searchParams.delete('itm_element');
            searchParams.delete('itm_campaign');
            return {
                title: title.text(),
                description: art(path.join(__dirname, '../templates/offer.art'), {
                    img: img.parent().html(),
                    desc: title.next().parent().html(),
                }),
                link: href,
                guid: `${href}#${title.text()}`,
            };
        });

    const banner = $('div[data-pub-type="banner"]')
        .toArray()
        .map((e) => {
            e = $(e);
            const title = e.find('h2');
            const next = title.next();
            const img = e.find('.pub__image').each((_, e) => {
                e.attribs.src = e.attribs.src.split('?')[0];
                delete e.attribs.srcset;
            });

            const link = new URL(next.find('a').attr('href'));
            const { searchParams, href } = link;
            searchParams.delete('itm_content');
            searchParams.delete('itm_element');
            searchParams.delete('itm_campaign');
            return {
                title: title.text(),
                description: art(path.join(__dirname, '../templates/offer.art'), {
                    img: img.parent().html(),
                    desc: title.parent().html(),
                }),
                link: href,
                guid: `${href}#${title.text()}`,
            };
        });

    return {
        title: 'IKEA UK - Offers',
        link,
        description: 'Offers by IKEA UK.',
        item: [...carousel, ...banner],
    };
}
