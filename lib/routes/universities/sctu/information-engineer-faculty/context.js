const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: `http://it.sctu.edu.cn/data.asp?fa=2&fl=12&zi=0&id=${ctx.params.id}`,
        responseType: 'arraybuffer',
        headers: {
            Referer: 'http://it.sctu.edu.cn/',
        },
    });

    const formal = (buffer) => {
        // HTML-buffer转为gb2312
        const data = iconv.decode(buffer, 'gb2312');

        return cheerio.load(data);
    };

    const $ = formal(response.data);

    const list = $('.data');

    ctx.state.data = {
        title: '四川旅游学院',
        link: 'http://www.sctu.edu.cn',
        description: $('meta[name="description"]').attr('content'),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return {
                        title: $(item.find('.data_bt')).text(),
                        pubDate: $(item.find('.data_in')).text(),
                        description: item.find('.data_co').html(),
                    };
                })
                .get(),
    };
};
