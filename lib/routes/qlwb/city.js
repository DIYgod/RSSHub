const got = require('@/utils/got');
const cheerio = require('cheerio');

const config = {
    linyi: 'http://linyi.qlwb.com.cn/yaowen/',
    dezhou: 'http://dezhou.qlwb.com.cn/yaowen/',
    weihai: 'http://jrwh.qlwb.com.cn/yaowen/',
    zaozhuang: 'http://jrzz.qlwb.com.cn/yw/',
    zibo: 'http://jrzb.qlwb.com.cn/yw/',
    yantai: 'http://yantai.qlwb.com.cn/yantai/yaowen/',
    weifang: 'http://jrwf.qlwb.com.cn/xw/',
    heze: 'http://jrhz.qlwb.com.cn/jjhz/',
    rizhao: 'http://jrrz.qlwb.com.cn/fbh/',
    taishan: 'http://taian.qlwb.com.cn/fabu/',
    liaocheng: 'http://www.qlwb.com.cn/news/sqds/liaocheng/',
    jining: 'http://jryh.qlwb.com.cn/jiningxinwen/',
};

module.exports = async (ctx) => {
    const newsUrl = config[ctx.params.city];

    const response = await got({
        method: 'get',
        url: newsUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('ul.list.list-point li a')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            return {
                title: item.text(),
                link: item.attr('href'),
            };
        })
        .get();

    ctx.state.data = {
        title: $('title').text(),
        link: newsUrl,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);
                    item.description = content('div.article-content').html();
                    item.pubDate = new Date(content('span.date').text() + ' GMT+8').toUTCString();
                    return item;
                })
            )
        ),
    };
};
