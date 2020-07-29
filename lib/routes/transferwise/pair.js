const got = require('@/utils/got');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

module.exports = async (ctx) => {
    dayjs.extend(customParseFormat);
    let yesterday = dayjs().subtract(1, 'day');
    const dayBefore = yesterday.subtract(1, 'day').format('YYYY-MM-DD');

    yesterday = yesterday.format('YYYY-MM-DD');

    const guid = `${ctx.params.source}-${ctx.params.target}-${yesterday}`;
    const cache = await ctx.cache.get(guid);

    const link = 'https://transferwise.com/tools/exchange-rate-alerts/';

    if (cache) {
        return Promise.resolve(JSON.parse(cache));
    } else {
        const source = ctx.params.source.toUpperCase();
        const target = ctx.params.target.toUpperCase();
        const api = `https://api.transferwise.com/v1/rates?source=${source}&target=${target}&from=${dayBefore}&to=${yesterday}&group=day`;

        const response = await got({
            method: 'get',
            url: api,
            headers: {
                Referer: 'https://transferwise.com/tools/exchange-rate-alerts/',
                authorization: 'Basic OGNhN2FlMjUtOTNjNS00MmFlLThhYjQtMzlkZTFlOTQzZDEwOjliN2UzNmZkLWRjYjgtNDEwZS1hYzc3LTQ5NGRmYmEyZGJjZA==',
                'Content-Type': 'application/json',
            },
        });

        const data = response.data;
        const trend = data[0].rate > data[1].rate;
        const diff = (data[0].rate - data[1].rate) / data[1].rate;

        const percent = (Math.abs(diff) * 100).toFixed(4);

        const title = `${source}/${target} ${trend ? '📈' : '📉'} @${data[0].rate} ${diff > 0 ? '' : '-'}${percent}%`;

        const description = `<h3>${source} to ${target}</h3><table><tbody><tr><th align="left" style="border: 1px solid black;">Date</th><th align="left" style="border: 1px solid black;">Rate</th></tr><tr><td style="border: 1px solid black;">${yesterday}</td><td style="border: 1px solid black;">${data[0].rate}</td></tr><tr><td style="border: 1px solid black;">${dayBefore}</td><td style="border: 1px solid black;">${data[1].rate}</td></tr></tbody></table>`;

        const single = {
            title,
            description,
            pubDate: new Date().toUTCString(),
            guid,
            link,
        };

        ctx.cache.set(guid, JSON.stringify(ctx.state.data));

        ctx.state.data = {
            title: `${source} to ${target} by TransferWise`,
            link,
            description: `Exchange Rate from TransferWise`,
            item: [single],
        };
    }
};
