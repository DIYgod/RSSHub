const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const baseUrl = 'https://art.icity.ly';

/**
 * type: ['all', 'latest', 'hot', 'end_soon', 'coming', 'outdated']
 * city: ['shanghai', 'beijing',....]
 */
module.exports = async (ctx) => {
    const city = ctx.params.city;
    const type = ctx.params.type || 'all';
    const url = `${baseUrl}/${city}/${type}`;
    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            Referer: url,
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.imsm-entries.list li');
    ctx.state.data = {
        title: `${$('title').text()}`,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item:
            list &&
            list
                .map((item, index) => {
                    item = $(index);
                    const pretitle = item.find('.pretitle').children()[0].prev ? item.find('.pretitle').children()[0].prev.data : '';
                    const subtitle = item.find('.subtitle').children()[0].next ? item.find('.subtitle').children()[0].next.data : '';
                    return {
                        title: item.find('div.title').text(),
                        description: `${subtitle} ${pretitle} <img referrerpolicy="no-referrer" src="${item.find('img.cover').attr('src')}">`,
                        link: `${baseUrl}${item.find('a.info').attr('href')}`,
                    };
                })
                .get(),
    };
};
