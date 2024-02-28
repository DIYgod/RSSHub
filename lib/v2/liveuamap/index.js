import got from '@/utils/got';
import { load } from 'cheerio';
import { isValidHost } from '@/utils/valid-host';

module.exports = async (ctx) => {
    let region = ctx.req.param('region') ?? 'ukraine';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 50;
    if (!isValidHost(region)) {
        throw new Error('Invalid region');
    }

    let url = `https://${region}.liveuamap.com/`;
    if (region === undefined) {
        region = 'Default';
        url = 'https://liveuamap.com/';
    }

    const response = await got({
        method: 'get',
        url,
    });
    const $ = load(response.data);

    const items = $('div#feedler > div')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('div.title').text(),
                description: item.find('div.title').text(),
                link: item.attr('data-link'),
            };
        });

    ctx.set('data', {
        title: `Liveuamap - ${region}`,
        link: url,
        item: items,
    });
};
