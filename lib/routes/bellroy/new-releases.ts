// @ts-nocheck
import got from '@/utils/got';

export default async (ctx) => {
    const host = 'https://bellroy.com';
    const url = 'https://production.products.boobook-services.com/products';
    const response = await got({
        method: 'get',
        url,
        searchParams: {
            currency_identifier: '1abe985632a1392e6a94b885fe193d5943b7c213',
            price_group: 'bellroy.com',
            'filter[dimensions][web_new_release]': 'new_style',
        },
    });
    const data = response.data.products;

    ctx.set('data', {
        title: 'Bellroy - New Releases',
        link: 'https://bellroy.com/collection/new-releases',
        description: 'Bellroy - New Releases',
        item: data.map((item) => ({
            title: item.attributes.name + ' - ' + item.attributes.dimensions.color,
            link: host + item.attributes.canonical_uri,
        })),
    });
};
