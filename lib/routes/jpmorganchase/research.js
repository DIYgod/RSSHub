const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const url = 'https://www.jpmorganchase.com/corporate/institute/research.htm';
module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url,
    });

    const title = 'All Reports';
    const $ = cheerio.load(response.data);

    const items = $('.globalphilsect')
        .map((index, item) => {
            item = $(item);
            return {
                title: item.find('.chaseanalytics-track-link').text(),
                link: item.find('.chaseanalytics-track-link').attr('href'),
                description: item.find('.lead-in + p').text(),
                pubDate: item.find('.lead-in').text(),
            };
        })
        .get();
    ctx.state.data = {
        title: `${title}JPMorgan Chase Institute`,
        link: url,
        description: `${title}JPMorgan Chase Institute`,
        item: items,
    };
};
