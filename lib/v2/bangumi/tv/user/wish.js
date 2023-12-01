const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
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

    const username = $('.name').find('a').html();
    const items = $('#browserItemList')
        .find('li')
        .toArray()
        .map((item) => {
            const aTag = $(item).find('h3').children('a');
            const jdate = $(item).find('.collectInfo').find('span').html();
            return {
                title: aTag.html(),
                link: 'https://bgm.tv' + aTag.attr('href'),
                pubDate: timezone(parseDate(jdate), 0),
            };
        });

    ctx.state.data = {
        title: `${username}想看的动画`,
        link: url,
        item: items,
        description: `${username}想看的动画列表`,
    };
};
