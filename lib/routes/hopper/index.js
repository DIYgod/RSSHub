const got = require('@/utils/got');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const from = ctx.params.from.toUpperCase();
    const to = ctx.params.to !== undefined ? ctx.params.to.toUpperCase() : 'Anywhere';

    const type = ctx.params.lowestOnly;

    const url = `https://www.hopper.com/deals/best/from/${from}/to/${to}`;
    const title = `Hopper - Flights From ${from} to ${to}`;

    const response = await got({
        method: 'get',
        url,
        searchParams: queryString.stringify({
            pid: 'website',
            c: 'flexweb',
        }),
    });

    const $ = cheerio.load(response.data);
    const list = $('div.prices li a');
    const items = [];

    if (list.length !== 0) {
        if (type === '1') {
            let lowest = 99999;
            let lowIndex = 0;

            list.each((i, e) => {
                const current = parseInt(
                    $(e)
                        .find('.price')
                        .text()
                        .replace(/\D/g, '')
                );

                if (current < lowest) {
                    lowest = current;
                    lowIndex = i;
                }
            });

            items.push(formatDesc($(list[lowIndex])));
        } else {
            list.each((i, e) => {
                items.push(formatDesc($(e)));
            });
        }
    }

    ctx.state.data = {
        title,
        link: url,
        description: title,
        item: items,
    };
};

const formatDesc = (e) => {
    const item = e.attr('href');
    let reg = new RegExp('destination=(.*?)&', 'g');
    const destination = reg.exec(item)[1];
    reg = new RegExp('origin=(.*?)&', 'g');
    const origin = reg.exec(item)[1];
    reg = new RegExp('departureDate=(.*?)&', 'g');
    const departureDate = reg.exec(item)[1];
    reg = new RegExp('returnDate=(.*?)&', 'g');
    const returnDate = reg.exec(item)[1];

    const price = e.find('.price').text();

    const title = `${origin} &#9992; ${destination} ${dayjs(departureDate).format('YYYY MMM')} for ${price}`;

    const description = `<table><tbody><tr><th align="left" style="border: 1px solid black;">From</th><th align="left" style="border: 1px solid black;">To</th><th align="left" style="border: 1px solid black;">Price</th></tr><tr><td style="border: 1px solid black;">
        ${origin}</td><td style="border: 1px solid black;">${destination}</td><td style="border: 1px solid black;">${price}</td></tr></tbody></table>${dayjs(departureDate).format('YYYY MMM DD')} &#9992; ${dayjs(returnDate).format(
        'YYYY MMM DD'
    )}`;
    return {
        title,
        description,
        link: item,
    };
};
