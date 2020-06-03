const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const homepage = 'https://checkra.in/releases/';

    const response = await got({
        method: 'get',
        url: homepage,
    });

    const $ = cheerio.load(response.data);
    const releases = $('.release');

    ctx.state.data = {
        title: `Checkra1n All Releases`,
        link: homepage,
        item: releases
            .map((i, item) => {
                const $item = $(item);
                const address = 'https://checkra.in' + $item.find('a').attr('href');

                return {
                    title: $item.find('h3').first().text(),
                    description: $item.find('.changelog').html(),
                    link: address,
                    guid: address,
                };
            })
            .get(),
    };
};
