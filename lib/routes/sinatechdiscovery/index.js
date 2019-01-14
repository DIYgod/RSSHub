const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {

    const response = await axios({
        method: 'get',
        url: 'https://tech.sina.com.cn/discovery/',
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.news-item').get();
    const result = list.map((item) => ({
        title: $(item)
            .find('h2 a')
            .text(),
        description: $(item)
            .find('h2 a')
            .text(),
        pubDate: new Date().toUTCString(),
        link: $(item)
            .find('h2 a')
            .attr('href'),
    }));
    ctx.state.data = {
        title: '科学探索_新浪科技',
        link: 'https://tech.sina.com.cn/discovery/',
        description: '科学探索_新浪科技',
        item: result,
    };
};
