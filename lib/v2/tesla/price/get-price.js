const got = require('@/utils/got');
const cheerio = require('cheerio');

async function getTeslaPrice(link) {
    const response = await got(link);

    const $ = cheerio.load(response.body);

    let price = '';

    for (let i = 0; i < $('p').length; i++) {
        const $ele = $('p').eq(i);
        if ($ele.text().trim().indexOf('经销商报价') > -1) {
            const priceDom = $ele.next();
            price = ' => 经销商报价: ' + $(priceDom).text().trim();
            break;
        }
    }

    return price;
}

module.exports = {
    getTeslaPrice,
};
