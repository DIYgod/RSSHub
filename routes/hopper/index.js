const axios = require('../../utils/axios');
const config = require('../../config');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const from = ctx.params.from;
    const to = ctx.params.to || 'Anywhere';

    const url = `https://www.hopper.com/deals/best/from/${from}/to/${to}`;
    const title = `Hopper - Flights From ${from} to ${to}`;

    const response = await axios({
        method: 'get',
        url,
        headers: {
            'User-Agent': config.ua,
        },
        params: {
            pid: 'website',
            c: 'flexweb',
        },
    });

    const $ = cheerio.load(response.data);
    const list = $('div.prices li a');

    ctx.state.data = {
        title,
        link: url,
        description: title,
        item: list
            .map((i, e) => {
                const item = $(e).attr('href');
                let reg = new RegExp('destination=(.*?)&', 'g');
                const destination = reg.exec(item)[1];
                reg = new RegExp('origin=(.*?)&', 'g');
                const origin = reg.exec(item)[1];
                reg = new RegExp('departureDate=(.*?)&', 'g');
                const departureDate = reg.exec(item)[1];
                reg = new RegExp('returnDate=(.*?)&', 'g');
                const returnDate = reg.exec(item)[1];

                const price = $(list[i])
                    .find('.price')
                    .text();

                const title = `${origin} &#9992; ${destination} ${getMonthYear(departureDate)} for ${price}`;

                const description = `<table><tbody><tr><th align="left" style="border: 1px solid black;">From</th><th align="left" style="border: 1px solid black;">To</th><th align="left" style="border: 1px solid black;">Price</th></tr><tr><td style="border: 1px solid black;">
                ${origin}</td><td style="border: 1px solid black;">${destination}</td><td style="border: 1px solid black;">${price}</td></tr></tbody></table>${formatDate(departureDate)} &#9992; ${formatDate(returnDate)}`;
                return {
                    title,
                    description,
                    guid: item,
                    link: item,
                };
            })
            .get(),
    };
};

function formatDate(v) {
    return new Intl.DateTimeFormat('en-gb', {
        year: 'numeric',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    }).format(new Date(v));
}

function getMonthYear(v) {
    const date = new Date(v);
    return date.toLocaleString('en-gb', {
        month: 'long',
        year: 'numeric',
    });
}
