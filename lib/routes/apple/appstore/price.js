const got = require('@/utils/got');
const currency = require('currency-symbol-map');
module.exports = async (ctx) => {
    const country = ctx.params.country;
    const type = ctx.params.type.toLowerCase() === 'mac' ? 'macapps' : 'apps';
    const id = ctx.params.id.replace('id', '');

    const url = `https://buster.cheapcharts.de/v1/DetailData.php?&store=itunes&country=${country}&itemType=${type}&idInStore=${id}`;

    const res = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: `http://www.cheapcharts.info/itunes/${country}/apps/detail-view/${id}`,
        },
    });

    if (!res.data.results) {
        const unsupported = '当前 app 未被收录. Price monitor is not available for this app.';
        ctx.state.data = {
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
    ctx.state.data = {
        title,
        link,
        item,
        allowEmpty: true,
    };
};
