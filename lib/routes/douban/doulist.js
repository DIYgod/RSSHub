const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://www.douban.com/doulist/';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const link = url.resolve(host, id);
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);

    const title = $('#content h1')
        .text()
        .trim();
    const description = $('div.doulist-about')
        .text()
        .trim();
    const out = $('div.doulist-item')
        .slice(0, 10)
        .map(function() {
            const title = $(this)
                .find('div.bd.doulist-note div.title a')
                .text()
                .trim();
            const link = $(this)
                .find('div.bd.doulist-note div.title a')
                .attr('href');
            const date = $(this)
                .find('div.ft div.actions time span')
                .attr('title');

            const description = $(this)
                .find('div.bd.doulist-note  div.abstract')
                .text()
                .trim();
            const single = {
                title: title,
                link: link,
                description: description,
                pubDate: new Date(date).toUTCString(),
            };
            return single;
        })
        .get();

    ctx.state.data = {
        title: title,
        link: link,
        description: description,
        item: out,
    };
};
