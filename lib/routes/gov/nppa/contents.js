const got = require('@/utils/got');
const cheerio = require('cheerio');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const { channel, content } = ctx.params;
    const host = `http://www.nppa.gov.cn`;
    const link = host + `/nppa/contents/${channel}/${content}.shtml`;
    const fullpage = await got.get(link + '?' + new Date().getTime()); // 避免CDN缓存
    if (~fullpage.data.indexOf('-404</title>')) {
        ctx.throw(404);
    }
    const $ = cheerio.load(fullpage.data);
    const list = $('.m3pageCon table.trStyle tbody tr');

    ctx.state.data = {
        title: '国家新闻出版署 - ' + $('.m3page_t').text().trim(),
        link: link,
        item: await Promise.all(
            list
                .slice(1)
                .map(async (index, item) => {
                    item = $(item).find('td');
                    return {
                        title: $(item[1]).text().trim(),
                        category: $(item[2]).text().trim(),
                        description: $(item[5]).text().trim(),
                        author: $(item[3]).text().trim() + ' | ' + $(item[4]).text().trim(),
                        pubDate: date($(item[7]).text().trim(), -8),
                        guid: $(item[6]).text().trim(),
                        link: link,
                    };
                })
                .get()
        ),
    };
};
