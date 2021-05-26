const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `http://m.mpaypass.com.cn/`;
    const listData = await got.get(link);
    const $list = cheerio.load(listData.data);
    ctx.state.data = {
        title: `新闻 - 移动支付网`,
        link,
        item: await Promise.all(
            $list('.newsbodylist')
                .map(async (_, el) => {
                    const $el = $list(el);
                    const $a = $el.find('.newsbodylist-title a');
                    const href = $a.attr('href');
                    const title = $a.text();
                    const date = $el.find('.newsbodylist-title span').text().split('|')[1];

                    const key = `${href}`;
                    let description;
                    const value = await ctx.cache.get(key);

                    if (value) {
                        description = value;
                    } else {
                        const contentData = await got.get(href);
                        const $content = cheerio.load(contentData.data);
                        description = $content('.newsbody').html();
                        ctx.cache.set(key, description);
                    }

                    return {
                        title: title,
                        description,
                        link: href,
                        pubDate: new Date(date).toUTCString(),
                    };
                })
                .get()
        ),
    };
};
