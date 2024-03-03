// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
const { generateRssData } = require('./utils');

export default async (ctx) => {
    const { country, gender } = ctx.req.param();
    const host = `https://arcteryx.com/${country}/en/`;
    const url = `${host}api/fredhopper/query`;
    const productUrl = `${host}shop/`;
    const pageUrl = `${host}c/${gender}/new-arrivals`;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            fh_location: `//catalog01/en_CA/gender>{${gender}}/intended_use>{newarrivals}`,
            fh_country: country,
            fh_view_size: 'all',
        },
    });
    const items = response.data.universes.universe[1]['items-section'].items.item.map((item, index, arr) => generateRssData(item, index, arr, country));

    ctx.set('data', {
        title: `Arcteryx - New Arrivals(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        link: pageUrl,
        description: `Arcteryx - New Arrivals(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        item: items.map((item) => ({
            title: item.name,
            link: productUrl + item.slug,
            description: art(path.join(__dirname, 'templates/product-description.art'), {
                item,
            }),
        })),
    });
};
