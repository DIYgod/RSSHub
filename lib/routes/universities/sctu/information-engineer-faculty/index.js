const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://it.sctu.edu.cn/list.asp?fa=2&fl=12&zi=0',
        responseType: 'arraybuffer',
        headers: {
            Referer: 'http://it.sctu.edu.cn/',
        },
    });
    // HTML-buffer转为gb2312
    const data = iconv.decode(response.data, 'gb2312');

    const $ = cheerio.load(data);

    const list = $('.list_dt a');

    ctx.state.data = {
        title: '四川旅游学院信息与工程系',
        link: 'http://www.sctu.edu.cn',
        description: $('meta[name="description"]').attr('content'),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return {
                        title: $(item.find('div')[0]).text(),
                        description: $(item.find('div')[1]).text(),
                        link: `http://it.sctu.edu.cn/${item.attr('href')}`,
                    };
                })
                .get(),
    };
};
