const got = require('@/utils/got');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const tracking = ctx.params.tracking;

    let single;

    const cache = await ctx.cache.get(tracking);
    if (cache) {
        single = JSON.parse(cache);
    } else {
        const response = await got({
            method: 'get',
            url: `https://www.myhermes.co.uk/ajax/ref/trackParcelByBarcode?barcode=${tracking}`,
        });

        let parcel = response.data;
        let message = '';

        if (parcel.length > 0) {
            parcel = parcel[0];

            if (parcel.point) {
                message += parcel.point.description;
            }

            if (parcel.location) {
                message += ` at ${parcel.location.description}`;
            }

            if (parcel.estimatedDeliveryDate) {
                message += ` ETA: ${dayjs(parcel.estimatedDeliveryDate).format('MMM DD')}`;
            }

            single = {
                pubDate: new Date(parcel.dateTime).toISOString(),
                title: message,
            };
        }

        ctx.cache.set(tracking, JSON.stringify(single));
    }

    ctx.state.data = {
        title: `Hermes Tracking ${tracking}`,
        link: `https://www.myhermes.co.uk/tracking-results.html?trackingNumber=${tracking}`,
        item: [single],
    };
};
