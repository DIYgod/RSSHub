const cheerio = require('cheerio');
const axios = require('../../utils/axios');
const { mapDetail } = require('./util');

module.exports = async (ctx) => {
    const { data } = await axios.get('https://tits-guru.com/thebest/perDay', {
        headers: { Accept: '' },
    });
    const $ = cheerio.load(data);

    const items = $('.post-row')
        .map((_, ele) => mapDetail($(ele)))
        .toArray();

    ctx.state.data = {
        title: 'TitsGuru - Babe of The Day',
        link: 'https://tits-guru.com/thebest/perDay',
        description: 'TitsGuru - Babe of The Day',
        item: items,
    };
};
