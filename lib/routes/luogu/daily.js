const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id || 92685;

    const link = `https://www.luogu.org/discuss/show/${id}`;
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    const title = $('#app-body-new div h1').text();

    const out = $('div.am-comment-main > div > p')
        .slice(0, 10)
        .map(function() {
            const info = {
                title:
                    $(this)
                        .find('strong')
                        .text() || $(this).text(),
                description: $(this).html(),
                link: $(this)
                    .find('a')
                    .attr('href'),
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title: title,
        link: link,
        item: out,
    };
};
