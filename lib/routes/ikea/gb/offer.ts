// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
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

    ctx.set('data', {
        title: 'IKEA UK - Offers',
        link,
        description: 'Offers by IKEA UK.',
        item: [...carousel, ...banner],
    });
};
