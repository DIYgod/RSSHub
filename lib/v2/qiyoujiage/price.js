const got = require('@/utils/got');
const cheerio = require('cheerio');
const md5 = require('@/utils/md5');

module.exports = async (ctx) => {
    const { path } = ctx.params;
    const link = `http://www.qiyoujiage.com/${path}.shtml`;

    const { data: response } = await got(link);
    const $ = cheerio.load(response);

    const priceText = $('#youjia').text();
    const item = [
        {
            title: priceText,
            description: $('#youjia').html(),
            link,
            guid: `${link}#${md5(priceText)}`,
        },
    ];

    ctx.state.data = {
        title: $('title').text(),
        description: $('meta[name="Description"]').attr('content'),
        link,
        item,
    };
};
