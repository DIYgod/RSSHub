const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const baseTitle = '常大新闻网';
const baseUrl = 'http://news.cczu.edu.cn';
const entryUrlRegex = /^\/(20\d{2})\/(\d{2})(\d{2})\/.*$/;

module.exports = async (ctx) => {
    const category = ctx.params.category || 'all';
    const pageUrl = baseUrl + (category === 'all' ? '/' : `/${category}/list.htm`);

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
        title: category === 'all' ? baseTitle : `${baseTitle} ${$('title').text()}`,
        item: $('div[id^="wp_news_w"] a')
            .filter((_, elem) => elem.attribs.href.match(entryUrlRegex))
            .map((_, elem) => ({
                link: url.resolve(pageUrl, elem.attribs.href),
                title: elem.attribs.title,
                pubDate: new Date(elem.attribs.href.replace(entryUrlRegex, '$1-$2-$3')).toUTCString(),
            }))
            .get(),
    };
};
