const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const host = 'http://www.szse.cn/';
module.exports = async (ctx) => {
    const link = 'http://www.szse.cn/disclosure/notice/company/index.html';
    const response = await got.get(link, {
        Referer: host,
    });
    const $ = cheerio.load(response.data);
    // 正则表达式匹配Script标签的url和title变量
    function getData(jscontent, option) {
        const urlpattern = /(?<=curHref = ').*?(?=';)/;
        const titlePattern = /(?<=curTitle =').*?(?=';)/;

        switch (option) {
            case 'title': {
                const jsoutput = jscontent.match(titlePattern);
                return jsoutput;
            }
            case 'url': {
                const jsoutput = jscontent.match(urlpattern);
                return jsoutput;
            }
            default:
                // console.log('default');
                break;
        }
    }

    const list = $('.article-list .newslist li')
        .toArray()
        .map((element) => {
            element = $(element);
            const info = {
                title: getData(element.find('script').text(), 'title'),
                link: new URL(getData(element.find('script').text(), 'url'), link).href,
                date: element.find('span.time').text().trim(), // trim移除多余的空格
            };
            return info;
        });
    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            const date = info.date;
            const itemUrl = url.resolve(host, info.link);
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return JSON.parse(cache);
            }
            const response = await got.get(itemUrl, {
                Referer: host,
            });
            const $ = cheerio.load(response.data);
            const description = $('#desContent').html();
            const single = {
                title,
                link: itemUrl,
                description,
                pubDate: new Date(date).toDateString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: '深圳证券交易所——上市公告-可转换债券',
        link,
        item: out,
    };
};
