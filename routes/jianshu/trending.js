const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://www.jianshu.com/trending/${ctx.params.timeframe}`;

    const response = await axios({
        method: 'get',
        url: link,
        headers: {
            Referer: link,
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.note-list li');

    ctx.state.data = {
        title: `简书 ${ctx.params.timeframe === 'weekly' ? '7' : '30'} 日热门`,
        link,
        description: `简书 ${ctx.params.timeframe === 'weekly' ? '7' : '30'} 日热门`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.title').text(),
                        description: `作者：${item.find('.nickname').text()}<br>描述：${item.find('.abstract').text()}<br><img referrerpolicy="no-referrer" src="https:${item.find('.img-blur').data('echo')}">`,
                        pubDate: new Date(item.find('.time').data('shared-at')).toUTCString(),
                        link: `https://www.jianshu.com${item.find('.title').attr('href')}`,
                    };
                })
                .get(),
    };
};
