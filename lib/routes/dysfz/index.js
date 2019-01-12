const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios.get('http://www.dysfz.vip');
    const $ = cheerio.load(response.data);
    const list = $('.movie-list li').get();
    const data = {
        title: '电影首发站',
        link: 'http://www.dysfz.vip',
        description: '高清电影',
        item: list.map((item) => ({
            title: $(item)
                .find('h2 a')
                .text(),
            description: $(item)
                .find('.txt')
                .text(),
            pubDate: new Date(
                $(item)
                    .find('.txt p>span:nth-child(1)')
                    .text()
            ).toUTCString(),
            link: $(item)
                .find('h2 a')
                .attr('href'),
        })),
    };

    ctx.state.data = data;
};
