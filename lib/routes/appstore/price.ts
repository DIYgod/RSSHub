import { Route } from '@/types';
import got from '@/utils/got';
import currency from 'currency-symbol-map';
export const route: Route = {
    path: '/price/:country/:type/:id',
    categories: ['program-update'],
    example: '/appstore/price/us/mac/id1152443474',
    parameters: {
        country: 'App Store Country, obtain from the app URL https://apps.apple.com/us/app/id1152443474, in this case, `us`',
        type: 'App type，either `iOS` or `mac`',
        id: 'App Store app id, obtain from the app URL https://apps.apple.com/us/app/id1152443474, in this case, `id1152443474`',
    },
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
            source: ['apps.apple.com/'],
        },
    ],
    name: 'Price Drop',
    maintainers: ['HenryQW'],
    handler,
    url: 'apps.apple.com/',
};

async function handler(ctx) {
    const country = ctx.req.param('country');
    const type = ctx.req.param('type').toLowerCase() === 'mac' ? 'macapps' : 'apps';
    const id = ctx.req.param('id').replace('id', '');

    const url = `https://buster.cheapcharts.de/v1/DetailData.php?&store=itunes&country=${country}&itemType=${type}&idInStore=${id}`;

    const res = await got({
        method: 'get',
        url,
        headers: {
            Referer: `http://www.cheapcharts.info/itunes/${country}/apps/detail-view/${id}`,
        },
    });

    if (!res.data.results) {
        const unsupported = '当前 app 未被收录. Price monitor is not available for this app.';
        return {
            title: unsupported,
            item: [{ title: unsupported }],
        };
        return;
    }

    let result = res.data.results.apps;
    if (type === 'macapps') {
        result = res.data.results.macapps;
    }

    const item = [];

    const title = `${country === 'cn' ? '限免提醒' : 'Price watcher'}: ${result.title} for ${type === 'macapps' ? 'macOS' : 'iOS'}`;

    const link = `https://apps.apple.com/${country}/app/id${id}`;

    if (result.priceDropIndicator === -1) {
        const single = {
            title: `${result.title} is now ${currency(result.currency)}${result.price} `,
            description: `<a href="${link}" target="_blank">Go to App Store</a>`,
            link,
            guid: id + result.priceLastChangeDate,
        };
        item.push(single);
    }
    return {
        title,
        link,
        item,
        allowEmpty: true,
    };
}
