import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { generateRssData } from './utils';

export default async (ctx) => {
    const { country, gender } = ctx.req.param();
    const host = `https://outlet.arcteryx.com/${country}/en/`;
    const url = `${host}api/fredhopper/query`;
    const productUrl = `${host}shop/`;
    const pageUrl = `${host}c/${gender}`;
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            fh_location: `//catalog01/en_CA/gender>{${gender}}`,
            fh_country: country,
            fh_review: 'lister',
            fh_view_size: 'all',
            fh_context_location: '//catalog01',
        },
    });
    const items = response.data.universes.universe[1]['items-section'].items.item.map((item, index, arr) => generateRssData(item, index, arr, country));

    ctx.set('data', {
        title: `Arcteryx - Outlet(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        link: pageUrl,
        description: `Arcteryx - Outlet(${country.toUpperCase()}) - ${gender.toUpperCase()}`,
        item: items.map((item) => ({
            title: item.name,
            link: productUrl + item.slug,
            description: art(path.join(__dirname, 'templates/product-description.art'), {
                item,
            }),
        })),
    });
};
