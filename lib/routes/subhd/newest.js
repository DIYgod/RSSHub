const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://subhd.tv/sub/new`,
    });
    const $ = cheerio.load(response.data);

    const item = $('.col-sm-9 div.position-relative')
        .map((index, ele) => {
            const link = $('table a.text-dark', ele).attr('href');
            const cover = $(ele).prev().find('a').html();
            return {
                title: $('table a.text-dark', ele).text(),
                link: `https://subhd.tv${link}`,
                author: $('.rounded-sm a', ele).text(),
                description: cover + $(ele).html(),
            };
        })
        .get();

    ctx.state.data = {
        title: `SubHD.tv - 最新字幕`,
        link: `https://subhd.tv/sub/new`,
        item,
    };
};
