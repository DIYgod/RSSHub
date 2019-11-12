const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'http://www.lit.edu.cn/tw/';

const nameProps = {
    tntz: '团内通知',
    qnkx: '青年快讯',
    llxx: '理论学习',
};

module.exports = async (ctx) => {
    const name = ctx.params.name || 'tntz';
    const u = url.resolve(baseUrl, `${name}.htm`);
    const response = await got({
        method: 'get',
        url: u,
    });

    const $ = cheerio.load(response.data);

    ctx.state.data = {
        title: `${nameProps[name]} - 洛理团委`,
        link: u,
        description: `洛阳理工学院团委 - ${nameProps[name]}`,
    };

    if (name === 'llxx') {
        ctx.state.data.item = $('li.newslist')
            .map((index, item) => ({
                title: $(item)
                    .find('a.type_one')
                    .text(),
                description: $(item)
                    .find('li.desc')
                    .text()
                    .trim(),
                pubDate: $(item)
                    .find('small')
                    .first()
                    .text()
                    .replace(/\//g, '-'),
                link:
                    baseUrl +
                    $(item)
                        .find('a.type_one')
                        .attr('href'),
            }))
            .get();
    } else {
        ctx.state.data.item = $('ul.caselist li')
            .map((index, item) => ({
                title: $(item)
                    .find('a')
                    .text(),
                description: '',
                pubDate: $(item)
                    .find('span.time')
                    .text(),
                link:
                    baseUrl +
                    $(item)
                        .find('a')
                        .attr('href'),
            }))
            .get();
    }
};
