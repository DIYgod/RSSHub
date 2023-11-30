const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;
module.exports = async (ctx) => {
    const userid = ctx.params.id;
    const url = `https://bgm.tv/anime/list/${userid}/wish`;
    const response = await got({
        url,
        method: 'get',
        headers: {
            'User-Agent': config.trueUA,
        },
    });
    const $ = cheerio.load(response.body);

    const items = $('#browserItemList')
        .find('li')
        .toArray()
        .map((item) => {
            const aTag = $(item).find('h3').children('a');
            return {
                title: aTag.html(),
                link: 'https://bgm.tv' + aTag.attr('href'),
            };
        });

    ctx.state.data = {
        title: 'Bangumi 想看',
        link: url,
        item: items,
        description: `Bangumi 用户-想看列表`,
    };
};
