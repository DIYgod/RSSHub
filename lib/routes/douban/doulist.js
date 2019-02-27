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
            const type = $(this)
                .find('div.source')
                .text();

            let title = $(this)
                .find('div.bd.doulist-note div.title a')
                .text()
                .trim();
            let link = $(this)
                .find('div.bd.doulist-note div.title a')
                .attr('href');
            let description = $(this)
                .find('div.bd.doulist-note  div.abstract')
                .text()
                .trim();

            if (type === '来自：豆瓣广播') {
                title = $(this)
                    .find('p.status-content > a')
                    .text()
                    .trim();
                link = $(this)
                    .find('p.status-content a')
                    .attr('href');

                description = $(this)
                    .find('span.status-recommend-text')
                    .text()
                    .trim();
            }

            const date = $(this)
                .find('div.ft div.actions time span')
                .attr('title');

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
