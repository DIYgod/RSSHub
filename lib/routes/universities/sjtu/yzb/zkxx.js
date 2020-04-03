const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

const baseTitle = '上海交通大学研究生招生网招考信息';
const baseUrl = 'https://yzb.sjtu.edu.cn/index/zkxx/';

module.exports = async (ctx) => {
    const pageUrl = `${baseUrl}${ctx.params.type}.htm`;

    const response = await got({
        method: 'get',
        url: pageUrl,
        headers: {
            Referer: pageUrl,
        },
    });

    const $ = cheerio.load(response.data);

    ctx.state.data = {
        link: pageUrl,
        title: `${baseTitle} -- ${$('title').text().split('-')[0]}`,
        item: $('li[id^="line"] a')
            .slice(0, 10)
            .map((_, elem) => ({
                link: url.resolve(pageUrl, elem.attribs.href),
                title: elem.attribs.title,
                pubDate: new Date($(elem.next).text().trim()).toUTCString(),
            }))
            .get(),
    };
};
