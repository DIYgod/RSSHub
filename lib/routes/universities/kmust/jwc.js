const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'http://jwc.kmust.edu.cn';
const dataRegex = /(?:20\d{2})\/(?:\d{2})\/(?:\d{2})/;
const typeProps = {
    notify: {
        url: '/html/jwtz/1.html',
        title: '教务通知',
    },
    news: {
        url: '/html/jwxw/1.html',
        title: '教务新闻',
    },
};

module.exports = async (ctx) => {
    const type = ctx.params.type || 'notify';
    const pageUrl = url.resolve(baseUrl, typeProps[type].url);
    const title = `${typeProps[type].title}-昆明理工大学`;
    const response = await axios({
        method: 'get',
        url: pageUrl,
        headers: {
            Referer: baseUrl,
        },
    });

    const $ = cheerio.load(response.data);

    ctx.state.data = {
        link: pageUrl,
        title,
        item: $('table[width="92%"] a[target="_blank"]')
            .map((_, elem) => ({
                link: url.resolve(baseUrl, elem.attribs.href),
                title: elem.children[0].data,
                pubDate: new Date(
                    elem.attribs.href
                        .match(dataRegex)[0]
                        .split('/')
                        .join('-')
                ).toUTCString(),
            }))
            .get(),
    };
};
