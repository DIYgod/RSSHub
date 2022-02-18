const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const host = 'https://www.douban.com/doulist/';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const link = url.resolve(host, id);
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('#content h1').text().trim();
    const description = $('div.doulist-about').text().trim();
    const out = $('div.doulist-item')
        .slice(0, 10)
        .map(function () {
            const type = $(this).find('div.source').text().trim();

            let title = $(this).find('div.bd.doulist-note div.title a').text().trim();
            let link = $(this).find('div.bd.doulist-note div.title a').attr('href');
            let description = $(this).find('div.bd.doulist-note  div.abstract').text().trim();

            if (type === '来自：豆瓣广播') {
                title = $(this).find('p.status-content > a').text().trim();
                link = $(this).find('p.status-content a').attr('href');

                description = $(this).find('span.status-recommend-text').text().trim();
            }

            if (type === '来自：豆瓣电影' || type === '来自：豆瓣' || type === '来自：豆瓣读书' || type === '来自：豆瓣音乐') {
                title = $(this).find('div.bd.doulist-subject div.title a').text().trim();
                link = $(this).find('div.bd.doulist-subject div.title a').attr('href');

                description = $(this).find('div.bd.doulist-subject div.abstract').text().trim();

                const ft = $(this).find('div.ft div.comment-item.content').text().trim();

                const img = $(this).find('div.post a img').attr('src');

                description = '<div><img width="100" src="' + img + '"></div>' + description + '<blockquote>' + ft + '</blockquote>';
            }

            const date = $(this).find('div.ft div.actions time span').attr('title');

            const single = {
                title,
                link,
                description,
                pubDate: new Date(date).toUTCString(),
            };
            return single;
        })
        .get();

    ctx.state.data = {
        title,
        link,
        description,
        item: out,
    };
};
