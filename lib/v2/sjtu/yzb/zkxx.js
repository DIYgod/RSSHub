const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

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
            .toArray()
            .map((elem) => ({
                link: new URL(elem.attribs.href, pageUrl).href,
                title: elem.attribs.title,
                pubDate: parseDate($(elem.next).text().trim()),
            })),
    };
};
