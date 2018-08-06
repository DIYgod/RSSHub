const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://book.qidian.com/info/${id}#Catalog`,
        headers: {
            'User-Agent': config.ua,
            Referer: `https://book.qidian.com/info/${id}`,
        },
    });

    const $ = cheerio.load(response.data);

    const name = $('.book-info>h1>em').text();
    const list = $('#j-catalogWrap li a');
    const cover_url = $('.bookImg>img').attr('src');
    const chapter_item = [];

    for (let i = list.length - 1; i >= 0; i--) {
        const el = $(list[i]);
        const item = {
            title: el.text(),
            link: `https:${el.attr('href')}`,
            pubDate: new Date(el.attr('title').substring(5, 25)).toUTCString(),
            description: el.attr('title'),
        };
        chapter_item.push(item);
    }
    ctx.state.data = {
        title: `起点 ${name}`,
        link: `https://book.qidian.com/info/${id}`,
        description: $('.book-info>p.intro').text(),
        image: cover_url,
        item: chapter_item,
    };
};
