const cheerio = require('cheerio');
const axios = require('../../utils/axios');
const { resolve } = require('url');

const parseDetail = (ele) => {
    const link = resolve('https://tits-guru.com', ele.find('.img-link').attr('href'));
    const title = ele.find('.img-link > img').attr('title');
    const image = ele
        .find('.horizontal-socials .socials-share-pinterest > span')
        .attr('data-src')
        .match(/media=(.+)&url=/)[1];
    return {
        link,
        title,
        description: `
            <img referrerpolicy="no-referrer" src="${image}" />
        `.trim(),
    };
};

module.exports = async (ctx) => {
    const { data } = await axios.get('https://tits-guru.com/thebest/perDay', {
        headers: { Accept: '' },
    });
    const $ = cheerio.load(data);

    const items = $('.post-row')
        .map((_, ele) => parseDetail($(ele)))
        .toArray();

    ctx.state.data = {
        title: 'TitsGuru - Babe of The Day',
        link: 'https://tits-guru.com/thebest/perDay',
        description: 'TitsGuru - Babe of The Day',
        item: items,
    };
};
