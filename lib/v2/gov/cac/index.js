const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const path = ctx.params[0];
    const host = `http://www.cac.gov.cn`;
    const homepage = `${host}/index.htm`;
    const { data: homepageResponse } = await got(homepage);
    const $ = cheerio.load(homepageResponse);
    const aList = $('a');
    // 在首页查找出所有的目录完整路径，比如http://www.cac.gov.cn/xxh/A0906index_1.htm
    // xxh --> {"path": "/xxh", "pathWithHtmlSubfix": "/xxh/A0906index_1.htm", "completeUrl": "http://www.cac.gov.cn/xxh/A0906index_1.htm"}
    const map = new Map();
    aList.toArray().forEach((item) => {
        const href = $(item).attr('href');
        if (href && href.startsWith('http://www.cac.gov.cn/')) {
            const matchArray = href.match(/http:\/\/www\.cac\.gov\.cn(.*?)\/(A.*?\.htm)/);
            if (matchArray && matchArray.length > 2) {
                const path = matchArray[1];
                const htmlName = matchArray[2];
                map.set(path, {
                    path,
                    pathWithHtmlSubfix: `${path}/${htmlName}`,
                    completeUrl: `${host}${path}/${htmlName}`,
                });
            }
        }
    });

    const completeUrl = map.get(path).completeUrl;
    const { data: channelResponse } = await got(completeUrl);
    const $_1 = cheerio.load(channelResponse);
    const itemList = $_1('li.clearfix').toArray();
    const items = new Array();
    itemList.forEach((item) => {
        const c = $_1(item);
        const a = c.find('a');
        const articleHref = a.attr('href');
        const title = a.text();
        const date = parseDate(c.find('span.times').text());
        items.push({
            link: articleHref,
            pubDate: date,
            title,
            description: title,
        });
    });

    ctx.state.data = {
        title: $_1('head title').text(),
        link: completeUrl,
        item: items,
    };
};
