const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://www.zhihu.com/collection/${id}`,
        headers: {
            'User-Agent': config.ua,
            Referer: `https://www.zhihu.com/collection/${id}`,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('div.zm-item');

    ctx.state.data = {
        title: $('title').text(),
        link: `https://www.zhihu.com/collection/${id}`,
        description: `${$('#zh-fav-head-description').text()}`,
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    let linkUrl = item.find('link').attr('href');
                    if (linkUrl.startsWith('/')) {
                        linkUrl = 'https://www.zhihu.com' + linkUrl;
                    }
                    return {
                        title: item.find('.zm-item-title a').text(),
                        description: `内容：${item.find('textarea').text()}`,
                        link: linkUrl,
                    };
                })
                .get(),
    };
};
