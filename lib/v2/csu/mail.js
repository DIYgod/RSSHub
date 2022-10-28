const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

async function fetch(address) {
    const res = await got(address);
    const $ = cheerio.load(res.data);
    return {
        description: $('.tb-ct-info').html(),
        link: address,
        guid: address,
    };
}

module.exports = async (ctx) => {
    const url = 'http://oa.csu.edu.cn/WebServer/MailBoxNew/MailList_Pub.aspx?tp=';
    const type = ctx.params.type;
    const link = url + type;
    const response = await got.get(link);
    const $ = cheerio.load(response.data);
    const list = $('.tbl-tb tr').get().slice(1);
    const out = await Promise.all(
        list.map((item) => {
            const $ = cheerio.load(item);
            const address = new URL($('a').attr('href'), url).href;
            const title = $('a').text();
            const author = $('td').eq(2).text();
            const pubDate = $('td').eq(3).text();
            return ctx.cache.tryGet(address, async () => {
                const single = await fetch(address);
                single.title = title;
                single.author = author;
                single.pubDate = parseDate(pubDate, 'YYYY/MM/DD');
                return single;
            });
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link,
        item: out,
    };
};
