const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = 'https://sou-yun.cn/AncientToday.aspx';
    const poemUrl = 'https://api.sou-yun.cn/api/RecommendedReading?type=poem&needHtml=true';
    const wordUrl = 'https://api.sou-yun.cn/api/RecommendedReading?type=word';

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const poemResponse = await got({
        method: 'get',
        url: poemUrl,
    });

    const wordResponse = await got({
        method: 'get',
        url: wordUrl,
    });

    const $ = cheerio.load(response.data);
    const birthday = $('span.titleHint').parent().html();
    const today = $('input[name="LastSelectedDate"]').attr('value');

    ctx.state.data = {
        title: '搜韵网 - 诗词日历',
        link: currentUrl,
        item: [
            {
                title: poemResponse.data.Date,
                link: currentUrl,
                description: poemResponse.data.Content.Text + '<br>' + birthday + '<br>' + wordResponse.data.Content.Text,
                pubDate: new Date(today + ' GMT+8').toUTCString(),
            },
        ],
    };
};
