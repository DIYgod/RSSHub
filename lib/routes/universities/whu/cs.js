const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');

const baseUrl = 'http://cs.whu.edu.cn';
const typelist = ['新闻动态', '学术讲座', '学院通知', '公示公告'];

module.exports = async (ctx) => {
    const type = parseInt(ctx.params.type);
    const response = await got.get(baseUrl);
    const $ = cheerio.load(response.data);
    let list;
    if (type === 0) {
        list = $('ul.txt-list>li');
    } else if (type === 1) {
        list = $('div.talks-list');
    } else if (type === 2) {
        list = $('div.fl>ul.list-wrap>li');
    } else if (type === 3) {
        list = $('div.fr>ul.list-wrap>li');
    }

    ctx.state.data = {
        title: `${typelist[type]} - 武汉大学计算机学院`,
        link: baseUrl,
        description: `${typelist[type]} - 武汉大学计算机学院`,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item)
                        .find('a')
                        .attr('title'),
                    description: $(item)
                        .find('p')
                        .text()
                        .trim(),
                    pubDate: date(
                        $(item)
                            .find('span')
                            .text()
                    ),
                    link:
                        baseUrl +
                        $(item)
                            .find('a')
                            .attr('href'),
                }))
                .get(),
    };
};
