import { type Cheerio, load } from 'cheerio';
import { type AnyNode, cloneNode, Document } from 'domhandler';

import type { Route } from '@/types';
import got from '@/utils/got';

function copyElements<T extends AnyNode>(selection: Cheerio<T>): Cheerio<T> {
    const copy = selection.map((_, element) => cloneNode(element, true));
    const root = new Document(copy.toArray());
    copy.each((_, element) => {
        element.parent = root;
    });
    return copy;
}

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
    const items = $('main .hri-content-card, main .hri-compact-card')
        .toArray()
        .map((element) => {
            const card = $(element);
            const title = card.find('.hri-content-card__title, .hri-compact-card__title').text();
            const href = card.find('a.hri-content-card__headers, a.hri-compact-card__link').attr('href');
            if (!title || !href) {
                throw new Error('Unable to extract an offer title or link from the IKEA UK offers page.');
            }
            const url = new URL(href, link);
            url.searchParams.delete('itm_content');
            url.searchParams.delete('itm_element');
            url.searchParams.delete('itm_campaign');
            const content = copyElements(card);
            content.find('.hri-content-card__headers, .hri-compact-card__link, .hri-content-card__footer, script, style, button, svg').remove();
            return {
                title,
                description: content.html() || undefined,
                link: url.href,
                guid: `${url.href}#${title}`,
            };
        });

    return {
        title: 'IKEA UK - Offers',
        link,
        description: 'Offers by IKEA UK.',
        item: items,
    };
}
