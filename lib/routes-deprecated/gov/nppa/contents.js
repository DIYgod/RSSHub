const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { channel, content } = ctx.params;
    const host = `http://www.nppa.gov.cn`;
    const link = host + `/nppa/contents/${channel}/${content}.shtml`;
    const fullpage = await got.get(link + '?' + Date.now()); // 避免CDN缓存
    if (~fullpage.data.indexOf('-404</title>')) {
        ctx.throw(404);
    }
    const $ = cheerio.load(fullpage.data);
    const list = $('.m3pageCon table.trStyle tbody tr');

    ctx.state.data = {
        title: '国家新闻出版署 - ' + $('.m3page_t').text().trim(),
        link,
        item: await Promise.all(
            list
                .slice(1)
                .map((index, item) => {
                    item = $(item).find('td');
                    return {
                        title: $(item[1]).text().trim(),
                        category: $(item[2]).text().trim(),
                        description: $(item[5]).text().trim(),
                        author: $(item[3]).text().trim() + ' | ' + $(item[4]).text().trim(),
                        pubDate: timezone(parseRelativeDate($(item[7]).text().trim()), 8),
                        guid: $(item[6]).text().trim(),
                        link,
                    };
                })
                .get()
        ),
    };
};
