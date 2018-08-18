const axios = require('../../utils/axios');
const currency = require('currency-symbol-map');
const config = require('../../config');

module.exports = async (ctx) => {
    const country = ctx.params.country;
    const type = ctx.params.type.toLowerCase() === 'mac' ? 'macapps' : 'apps';
    const id = ctx.params.id.replace('id', '');

    const url = `https://buster.cheapcharts.de/v1/DetailData.php?&store=itunes&country=${country}&itemType=${type}&idInStore=${id}`;

    const res = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
            Referer: `http://www.cheapcharts.info/itunes/${country}/apps/detail-view/${id}`,
        },
    });

    let result = res.data.results.apps;
    if (type === 'macapps') {
        result = res.data.results.macapps;
    }

    const item = [];

    const title = `${country === 'cn' ? '限免提醒' : 'Price watcher'}: ${result.title} for ${type === 'macapps' ? 'macOS' : 'iOS'}`;

    const link = `https://itunes.apple.com/${country}/app/id${id}`;

    if (result.priceDropIndicator === -1) {
        const single = {
            title: `${result.title} is now ${currency(result.currency)}${result.price} `,
            description: `<a href="${link}" target="_blank">Go to App Store</a>`,
            link,
            guid: country + id,
        };
        item.push(single);
    }
    ctx.state.data = {
        title,
        link: url,
        item,
    };
};
