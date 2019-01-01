const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `https://www.huxiu.com/tags/${id}.html`;
    const response = await axios({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.related-article li')
        .map((index, elem) => {
            const $elem = $(elem);
            const $link = $elem.find('a');
            const title = $link.text();
            const time = $elem.find('.time').text();
            const link = $link.attr('href');

            return {
                title,
                link: `https://www.huxiu.com${link}`,
                description: title,
                pubDate: new Date(time).toUTCString(),
            };
        })
        .get();

    ctx.state.data = {
        title: `虎嗅-${$('.tag-title').text()}`,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: list,
    };
};
