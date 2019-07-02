const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params && ctx.params.type;
    let index;
    if (type === undefined) {
        index = 24;
    } else if (type === 2) {
        index = 20;
    } else {
        index = 24;
    }
    const dirname = 'http://jwc.nankai.edu.cn/';
    const response = await got({
        method: 'get',
        url: `${dirname}${index}/list.htm`,
        responseType: 'buffer',
        headers: {
            Referer: 'http://jwc.nankai.edu.cn/',
        },
    });

    const $ = cheerio.load(response.data);

    const list = $('#wp_news_w6 ul li').slice(0, 10);

    ctx.state.data = {
        title: '南开大学教务处',
        link: 'http://www.nankai.edu.cn',
        description: $('meta[name="description"]').attr('content'),
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return {
                        title: $(item.find('a')).text(),
                        pubDate: $(item.find('.Article_PublishDate')).text(),
                        description: `发布日期：${$(item.find('.Article_PublishDate')).text()}`,
                        link: `${dirname + $(item.find('a')).attr('href')}`,
                    };
                })
                .get(),
    };
};
