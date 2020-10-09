const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www2.scut.edu.cn/jtxs/24241/list.htm',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('#wp_news_w5 li');

    ctx.state.data = {
        title: '华南理工大学土木与交通学院 - 学工通知',
        link: 'http://www2.scut.edu.cn/jtxs/24241/list.htm',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('li a').text(),
                        description: item.find('li a').text(),
                        link: item.find('li a').attr('href'),
                        pubDate: item.find('.Article_PublishDate').text(),
                    };
                })
                .get(),
    };
};
