const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async(ctx) = >{
    const response = await axios({
        method: 'get',
        url: 'https://www.xkcd.com',
        headers: {
            Referer: 'https://www.xkcd.com',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    let preUrl = $('[rel="prev"]').attr('href');
    let realUrl = String(Number(preUrl) + 1)

    ctx.state.data = {
        title: 'xkcd',
        link: 'https://www.xkcd.com',
        description: $('img[title]').attr('title'),
        item: [{
            title: $('.ctitle').text(),
            description: $('img[title]').attr('title'),
            link: "https://www.xkcd.com" + realUrl,
            itunes_item_image: $('img', 'comic'),
        },
        ],
    };
};
