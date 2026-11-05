import { renderToString } from 'hono/jsx/dom/server';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';

function appendRentalAPIParams(urlString) {
    const searchParams = new URLSearchParams(urlString);
    searchParams.set('firstRow', '0');
    searchParams.set('page', '1');

    return searchParams.toString();
}

async function getHouseList(houseListURL) {
    const { data } = await got({
        url: houseListURL,
        headers: {
            Referer: 'https://rent.591.com.tw/',
        },
    });
    if (data.status !== 1 || !Array.isArray(data.data?.items)) {
        throw new Error(`591 rental search failed: ${data.msg || 'the source returned no listing data'}`);
    }
    return data.data.items;
}

const renderHouse = (house) => {
    const photoList = house.photoList ?? [];

    return renderToString(
        <>
            {photoList[0] && <img src={photoList[0]} style="margin-bottom: 20px;" />}
            <table>
                <tr>
                    <td>類型</td>
                    <td>{house.kind_name}</td>
                </tr>
                <tr>
                    <td>坪數</td>
                    <td>{house.area} 坪</td>
                </tr>
                <tr>
                    <td>樓層</td>
                    <td>{house.floor_name}</td>
                </tr>
                <tr>
                    <td>社區</td>
                    <td>{house.community_name}</td>
                </tr>
                <tr>
                    <td>地點</td>
                    <td>{house.address}</td>
                </tr>
                <tr>
                    <td>更新時間</td>
                    <td>{house.refresh_time}</td>
                </tr>
            </table>
            <p>
                更多資訊請見 <a href={house.url}>591 租屋</a>
            </p>
            <br />
            <h3>更多圖片</h3>
            <br />
            <div id="more-pictures">
                {photoList.slice(1).map((photo) => (
                    <img src={photo} style="margin-bottom: 20px;" />
                ))}
            </div>
        </>
    );
};

export const route: Route = {
    path: '/:country/rent/:query?',
    categories: ['other'],
    example: '/591/tw/rent/order=posttime&orderType=desc',
    parameters: { country: 'Country code. Only tw is supported now', query: 'Query Parameters' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Rental house',
    maintainers: ['Yukaii'],
    handler,
    description: `::: tip
Copy the query parameters after \`?\` from the 591 filter housing page URL. The feed always requests the first page of matching listings.
:::`,
};

async function handler(ctx) {
    const query = ctx.req.param('query') ?? '';
    const country = ctx.req.param('country') ?? 'tw';

    if (country !== 'tw') {
        throw new InvalidParameterError('Invalid country codes. Only "tw" is supported now.');
    }

    const houses = await getHouseList(`https://bff-house.591.com.tw/v3/web/rent/list?${appendRentalAPIParams(query)}`);

    const queryUrl = `https://rent.591.com.tw/list?${query}`;

    const items = houses.map((house) => {
        const { title, price, price_unit: priceUnit } = house;
        const itemTitle = `${title} - ${price} ${priceUnit}`;

        const description = renderHouse(house);

        return {
            title: itemTitle,
            description,
            link: house.url,
            category: house.tags,
        };
    });

    ctx.set('json', {
        houses,
    });

    return {
        title: '591 租屋 - 自訂查詢',
        link: queryUrl,
        description: `591 租屋 - 自訂查詢, query: ${query}`,
        item: items,
    };
}
