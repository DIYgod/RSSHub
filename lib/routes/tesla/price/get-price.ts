import { load } from 'cheerio';

import NotFoundError from '@/errors/types/not-found';
import got from '@/utils/got';

async function getTeslaPrice(link) {
    const response = await got(link);

    const $ = load(response.body);

    let price = '';

    for (let i = 0; i < $('p').length; i++) {
        const $ele = $('p').eq(i);
        if ($ele.text().trim().includes('经销商报价')) {
            const priceDom = $ele.next();
            const quote = $(priceDom).text().trim();
            if (quote) {
                price = ' => 经销商报价: ' + quote;
            }
            break;
        }
    }

    if (!price) {
        throw new NotFoundError(`Dealer prices are unavailable at ${link}. Dongchedi may require login to view this page.`);
    }

    return price;
}

export { getTeslaPrice };
