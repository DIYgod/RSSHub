const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `http://www.chinatax.gov.cn/chinatax/n810341/n810755/index.html`;

    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const list = $('ul.list.whlist li')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: new URL(a.attr('href'), `http://www.chinatax.gov.cn`).toString(),
            };
        })
        .get();
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const res = await got({ method: 'get', url: item.link });
                    const content = cheerio.load(res.data);
                    item.pubDate = content('meta[name="PubDate"]').attr('content');
                    item.description = content('#fontzoom').html();
                    return item;
                } catch (err) {
                    if (err.name === 'HTTPError') {
                        item.description = err.message;
                        return item;
                    }
                    throw err;
                }
            })
        )
    );

    ctx.state.data = {
        title: '国家税务总局 - 最新文件',
        link,
        item: items,
    };
};
