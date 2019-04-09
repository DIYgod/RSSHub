const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://gitbook.cn/gitchat/news/0/20?searchKey=',
    });
    const $ = cheerio.load(response.data.data);
    const resultItem = $('.col-md-12')
        .map((index, item) => {
            item = $(item);
            const author = item.find('.chat_info_author').text();

            return {
                title: item.find('.chat_info_title').text(),
                description:
                    `作者: ${author}<br><br>` +
                    item
                        .find('.chat_info_desc')
                        .text()
                        .replace(/\n/g, '<br>'),
                link: `https://gitbook.cn${item
                    .find('a')
                    .eq(0)
                    .attr('href')}`,
                author,
            };
        })
        .get();

    ctx.state.data = {
        title: 'GitChat-最新',
        link: 'https://gitbook.cn/gitchat/news',
        description: 'GitChat 是一款基于微信平台的知识分享产品。通过这款产品我们希望改变IT知识的学习方式。',
        item: resultItem,
    };
};
