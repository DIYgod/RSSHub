import got from '~/utils/got.js';
import {toTitleCase} from '~/utils/common-utils';
import dayjs from 'dayjs';

export default async (ctx) => {
    const {
        locations
    } = ctx.params;

    let {
        nearby = '0'
    } = ctx.params;
    nearby = nearby === '1' ? 'true' : 'false';

    let host = 'https://alltheflightdeals.com/deals';

    let url = 'https://alltheflightdeals.com/deals/locations?origins=[';

    for (const pair of locations.split(',')) {
        const [country] = pair.split('+');
        const city = toTitleCase(pair.split('+')[1]);
        url += `{"country":"${country}","city":"${city}"},`;

        host += `/${country}/${city.replace(' ', '_')}`;
    }

    url = url.slice(0, -1) + `]&includeNearbyOrigins=${nearby}`;

    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: host,
        },
    });
    const data = response.data.data.slice(0, 10);

    ctx.state.data = {
        title: 'All the Flight Deals',
        link: host,
        description: 'All the Flight Deals',
        item: data.map((item) => ({
            title: `[${item.dateRanges[0] ? dayjs(item.dateRanges[0].start).format('YYYY MMM DD') + ' to ' + dayjs(item.dateRanges[0].end).format('YYYY MMM DD') : ''}]  ${item.title}`,
            description: `<img src="https://alltheflightdeals.com/assets/cities/${item.cityPairs[0].destinationCity.id}.jpg" alt="${item.cityPairs[0].destination.city},${item.cityPairs[0].destination.countryName}"> <br><table><tbody><tr><th align="left" style="border: 1px solid black;">From</th><th align="left" style="border: 1px solid black;">To</th><th align="left" style="border: 1px solid black;">Price</th></tr><tr><td style="border: 1px solid black;"><b>${item.cityPairs[0].origin.iata}</b>, ${item.cityPairs[0].origin.city}, ${item.cityPairs[0].origin.countryName}</td><td style="border: 1px solid black;"><b>${item.cityPairs[0].destination.iata}</b>, ${item.cityPairs[0].destination.city}, ${item.cityPairs[0].destination.countryName}</td><td style="border: 1px solid black;">${item.currency} ${item.price}</td></tr></tbody></table>`,
            pubDate: new Date(item.createdAt),
            guid: item.id,
            link: item.url,
        })),
    };
};
