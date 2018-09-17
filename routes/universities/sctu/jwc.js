const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const dirname = 'http://www.sctu.edu.cn/jwc/';
    const response = await axios({
        method: 'get',
        url: `${dirname}list.asp?type=12&fl=${+ctx.params.type === 14 ? 14 : 13}`,
        responseType: 'arraybuffer',
        headers: {
            Referer: 'http://www.sctu.edu.cn',
        },
    });

    // HTML-buffer转为gb2312
    const data = iconv.decode(response.data, 'gb2312');

    const $ = cheerio.load(data);

    const list = $('#list1 ul li');

    ctx.state.data = {
        title: '四川旅游学院首页',
        link: 'http://www.sctu.edu.cn',
        description: $('meta[name="description"]').attr('content'),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return {
                        title: $(item.find('a')).text(),
                        pubDate: $(item.find('dl')).text(),
                        description: `发布日期：${$(item.find('dl')).text()}`,
                        link: `${dirname + $(item.find('a')).attr('href')}`,
                    };
                })
                .get(),
    };
};
