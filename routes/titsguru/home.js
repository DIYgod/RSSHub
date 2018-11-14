const cheerio = require('cheerio');
const axios = require('../../utils/axios');
const { mapDetail } = require('./util');

module.exports = async (ctx) => {
    const { data } = await axios.get('https://tits-guru.com', {
        headers: { Accept: '' },
    });
    const $ = cheerio.load(data);

    const items = $('.post-row')
        .map((_, ele) => mapDetail($(ele)))
        .toArray();

    ctx.state.data = {
        title: 'TitsGuru',
        link: 'https://tits-guru.com/',
        description: 'TitsGuru',
        item: items,
    };
};
