import { Data, Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { art } from '@/utils/render';
import path from 'node:path';

export const route: Route = {
    path: '/index/:productID',
    categories: ['program-update'],
    example: '/ipsw.dev/index/iPhone16,1',
    parameters: {
        productID: 'Product ID',
    },
    name: 'Apple latest beta firmware',
    maintainers: ['RieN7'],
    handler,
};

async function handler(ctx) {
    const { productID } = ctx.req.param();
    const link = `https://ipsw.dev/product/version/${productID}`;

    const resp = await got({
        method: 'get',
        url: link,
        headers: {
            Referer: 'https://ipsw.dev/',
        },
    });

    const $ = load(resp.data);

    const productName = $('#IdentifierModal > div > div > div.modal-body > p:nth-child(1) > em').text();

    const list: Data[] = $('.firmware')
        .map((index, element) => {
            const ele = $(element);
            const version = ele.find('td:nth-child(1) > div > div > strong').text();
            const build = ele.find('td:nth-child(1) > div > div > div > code').text();
            const date = ele.find('td:nth-child(3)').text();
            const size = ele.find('td:nth-child(4)').text();
            return {
                title: `${productName} - ${version}`,
                link: `https://ipsw.dev/download/${productID}/${build}`,
                pubDate: new Date(date).toLocaleDateString(),
                guid: build,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    version,
                    build,
                    date,
                    size,
                }),
            };
        })
        .get();

    return {
        title: `${productName} Released`,
        link,
        item: list,
    };
}
