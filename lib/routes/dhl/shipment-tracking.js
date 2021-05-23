const got = require('@/utils/got');

const monthMap = {
    一月: 0,
    二月: 1,
    三月: 2,
    四月: 3,
    五月: 4,
    六月: 5,
    七月: 6,
    八月: 7,
    九月: 8,
    十月: 9,
    十一月: 10,
    十二月: 11,
};

module.exports = async (ctx) => {
    const id = ctx.params && ctx.params.id;

    const response = await got({
        method: 'get',
        url: `https://www.logistics.dhl/shipmentTracking?AWB=${id}&countryCode=CN&languageCode=zh`,
        headers: {
            Accept: 'application/json',
        },
    });
    const data = response.data;
    const result = data.results[0];

    const link = `https://www.logistics.dhl/cn-zh/home/tracking/tracking-express.html?tracking-id=${id}`;

    ctx.state.data = {
        title: `Shipment tracking for DHL (${id})`,
        link,
        item: result.checkpoints.map((checkpoint) => {
            const [, month, day, year] = checkpoint.date.match(/^[^,]+, ([^ ]+) (\d+), (\d+)/i);
            const [, hour, minute] = checkpoint.time.match(/(\d+):(\d+)/);
            const date = new Date();

            date.setFullYear(year);
            date.setMonth(monthMap[month]);
            date.setDate(day);
            date.setHours(hour);
            date.setMinutes(minute);
            date.setSeconds(0);
            date.setMilliseconds(0);

            return {
                title: checkpoint.description,
                pubDate: date.toUTCString(),
                link: `${link}&checkpoint=${encodeURIComponent(checkpoint.counter)}`,
            };
        }),
    };
};
