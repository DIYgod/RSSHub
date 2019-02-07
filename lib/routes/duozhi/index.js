const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = 'http://www.duozhi.com/';
    const response = await axios({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(response.data);
    const postList = $('.post-list .post').get();
    const result = postList.map((item) => ({
        title: $(item)
            .find('.post-title')
            .find('a')
            .text(),
        link: $(item)
            .find('.post-title')
            .find('a')
            .attr('href'),
        guid: $(item)
            .find('.post-title')
            .find('a')
            .attr('href'),
        description: $(item)
            .find('.post-content')
            .find('.desc')
            .find('p')
            .text(),
        pubDate: $(item)
            .find('.meta-date')
            .text(),
    }));
    ctx.state.data = { title: '多知网', link: 'http://www.duozhi.com/', description: '独立商业视角 新锐教育观察', item: result };
};
