const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const url = `https://www.huxiu.com/search.html?s=${encodeURIComponent(keyword)}&sort=dateline:desc`;
    const response = await axios({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.search-wrap-list-ul > li')
        .map((index, elem) => {
            const $elem = $(elem);
            const $link = $elem.find('a').eq(0);
            const title = $link.text();
            const time = $elem.find('.time').text();
            const link = $link.attr('href');
            const description = $elem.find('.mob-summay').text();

            return {
                title,
                link: `https://www.huxiu.com${link}`,
                description,
                pubDate: new Date(time).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: `虎嗅-${keyword}`,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: list,
    };
};
