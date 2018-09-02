const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://what-if.xkcd.com/',
        headers: {
            Referer: 'https://what-if.xkcd.com/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    ctx.state.data = {
        title: 'what-if',
        link: 'https://what-if.xkcd.com/',
        description: "xkcd' article",
        item: [
            {
                title: $('h1').text(),
                description: $('#question').text(),
                pubDate: '',
                guid: '',
                link: 'https:' + $('article a:first').attr('href'),
            },
        ],
    };
};
