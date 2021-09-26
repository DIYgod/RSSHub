const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params && ctx.params.type;
    let index;
    if (type === undefined) {
        index = 8;
    } else if (type === "nd") {
        index = 13;
    } else if (type === "ndf"){
        index = 14;
    } else if (type === "nfz"){
        index = 15;
    } else if (type === "nfb"){
        index = 16;
    } else {
        index = 8;
    }

    const dirname = 'http://xb.nankai.edu.cn/category';
    const article_dirname = 'http://xb.nankai.edu.cn'
    const response = await got({
        method: 'get',
        url: `${dirname}/${index}/1`,
        responseType: 'buffer',
        headers: {
            Referer: 'http://xb.nankai.edu.cn/',
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('li[role=presentation]').slice(0, 10);

    ctx.state.data = {
        title: '南开大学校办',
        link: 'http://xb.nankai.edu.cn',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: $(item.find('a')).text(),
                        pubDate: $(item.find('.time')).text(),
                        description: `发布日期：${$(item.find('.time')).text()}`,
                        link: `${article_dirname}${$(item.find('a')).attr('href')}`,
                    };
                })
                .get(),
    };
};
