const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const link = `http://m.mpaypass.com.cn/`;
    const listData = await got.get(link);
    const $list = cheerio.load(listData.data);
    ctx.state.data = {
        title: `新闻 - 移动支付网`,
        link,
        language: 'zh-CN',
        item: await Promise.all(
            $list('.Newslist-li')
                .map(async (_, el) => {
                    const $el = $list(el);
                    const $a = $el.find('.Newslist-title a');
                    const href = $a.attr('href');
                    const title = $a.text();
                    const date = $el.find('.Newslist-time span').text();

                    const key = href;
                    let description;
                    const value = await ctx.cache.get(key);

                    if (value) {
                        description = value;
                    } else {
                        const contentData = await got.get(href);
                        const $content = cheerio.load(contentData.data);
                        description = $content('.newslist-body').html();
                        ctx.cache.set(key, description);
                    }

                    return {
                        title,
                        description,
                        link: href,
                        pubDate: timezone(date, +8),
                    };
                })
                .get()
        ),
    };
};
