import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';

const host = 'https://www.regear.arcteryx.com';
function getUSDPrice(number) {
    return (number / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
export const route: Route = {
    path: '/regear/new-arrivals',
    categories: ['shopping'],
    example: '/arcteryx/regear/new-arrivals',
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
            source: ['regear.arcteryx.com/shop/new-arrivals', 'regear.arcteryx.com/'],
        },
    ],
    name: 'Regear New Arrivals',
    maintainers: ['EthanWng97'],
    handler,
    url: 'regear.arcteryx.com/shop/new-arrivals',
};

async function handler() {
    const url = `${host}/shop/new-arrivals`;
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data;
    const $ = load(data);
    const contents = $('script:contains("window.__PRELOADED_STATE__")').text();
    const regex = /{.*}/;
    let items = JSON.parse(contents.match(regex)[0]).shop.items;
    items = items.filter((item) => item.availableSizes.length !== 0);

    const list = items.map((item) => {
        const data = {
            title: item.displayTitle,
            link: item.pdpLink.url,
            imgUrl: JSON.parse(item.imageUrls).front,
            availableSizes: item.availableSizes,
            color: item.color,
            originalPrice: getUSDPrice(item.originalPrice),
            regearPrice: item.priceRange[0] === item.priceRange[1] ? getUSDPrice(item.priceRange[0]) : `${getUSDPrice(item.priceRange[0])} - ${getUSDPrice(item.priceRange[1])}`,
            description: '',
        };
        data.description = renderToString(
            <div>
                Available Sizes:&nbsp;
                {data.availableSizes.map((size) => (
                    <>{size}&nbsp;</>
                ))}
                <br />
                Color: {data.color}
                <br />
                Original Price: {data.originalPrice}
                <br />
                Regear Price: {data.regearPrice}
                <br />
                <img src={data.imgUrl} />
                <br />
                <br />
            </div>
        );
        return data;
    });

    return {
        title: 'Arcteryx - Regear - New Arrivals',
        link: url,
        description: 'Arcteryx - Regear - New Arrivals',
        item: list.map((item) => ({
            title: item.title,
            link: item.link,
            description: item.description,
        })),
    };
}
