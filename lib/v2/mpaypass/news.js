const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const link = 'http://m.mpaypass.com.cn';
    const listData = await got(link);
    const $list = cheerio.load(listData.data);
    ctx.state.data = {
        title: '新闻 - 移动支付网',
        link,
        language: 'zh-CN',
        item: await Promise.all(
            $list('.Newslist-li')
                .map((_, el) => {
                    const $el = $list(el);
                    const $a = $el.find('.Newslist-title a');
                    const href = $a.attr('href');
                    const title = $a.text();
                    const date = $el.find('.Newslist-time span').text();

                    return ctx.cache.tryGet(href, async () => {
                        const contentData = await got.get(href);
                        const $content = cheerio.load(contentData.data);
                        const description = $content('.newslist-body').html();

                        return {
                            title,
                            description,
                            link: href,
                            pubDate: timezone(parseDate(date), +8),
                        };
                    });
                })
                .get()
        ),
    };
};
