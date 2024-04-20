const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.ofweek.com/CATList-8100-CHANGYIEXINWE.html',
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'gbk'));
    const list = $('div.list-left div.con-details h3 > a')
        .slice(0, 20)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link, responseType: 'buffer' });
                const content = cheerio.load(iconv.decode(res.data, 'gbk'));
                const artical = content('div.artical');
                item.description = artical.find('#articleC').html();
                item.author = artical.find('div.source-name').text();
                item.pubDate = artical.find('div.time.fl').text();
                item.pubDate = new Date(item.pubDate + ' GMT+8').toUTCString();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: '高科技行业门户',
        link: 'https://www.ofweek.com/CATList-8100-CHANGYIEXINWE.html',
        item: items,
    };
};
