const axios = require('../../utils/axios');
const cheerio = require('cheerio');

const url = 'https://music.douban.com/latest';
module.exports = async (ctx) => {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.dlist').get();
    ctx.state.data = {
        title: '豆瓣最新增加的音乐',
        link: url,
        item: list.map((item) => ({
            title: $(item)
                .find('.pl2')
                .text(),
            link: $(item)
                .find('.pl2')
                .attr('href'),
            description: $(item).html(),
        })),
    };
};
