// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';

async function getTeslaPrice(link) {
    const response = await got(link);

    const $ = load(response.body);

    let price = '';

    for (let i = 0; i < $('p').length; i++) {
        const $ele = $('p').eq(i);
        if ($ele.text().trim().includes('经销商报价')) {
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
