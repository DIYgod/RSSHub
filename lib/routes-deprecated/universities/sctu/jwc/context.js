const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://www.sctu.edu.cn/jwc/content.asp?type=12&fl=${ctx.params.type}&id=${ctx.params.id}`,
        responseType: 'buffer',
        headers: {
            Referer: 'http://sctu.edu.cn/',
        },
    });

    const formal = (buffer) => {
        // HTML-buffer转为gb2312
        const data = iconv.decode(buffer, 'gb2312');

        return cheerio.load(data);
    };

    const $ = formal(response.data);

    const list = $('#list2').slice(0, 10);

    ctx.state.data = {
        title: '四川旅游学院信息与工程学院',
        link: 'http://www.sctu.edu.cn',
        description: $('meta[name="description"]').attr('content'),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return {
                        title: $(item.find('.title')).text(),
                        pubDate: $(item.find('.info')).text(),
                        description: item.html(),
                    };
                })
                .get(),
    };
};
