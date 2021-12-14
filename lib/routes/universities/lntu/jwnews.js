const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');

module.exports = async (ctx) => {
    const link = 'http://jwzx.lntu.edu.cn/index/jwgg.htm';
    const response = await got.get(link);

    const $ = cheerio.load(response.data);
    const list = $('.tr-ri ul').find('li').get();

    const res = await Promise.all(
        list.map(async (item) => {
            let $ = cheerio.load(item);
            // 通过解析后的子项地址
            const item_link = url.resolve(link, $('a').attr('href'));

            const description = await ctx.cache.tryGet(item_link, async () => {
                const result = await got.get(item_link);

                $ = cheerio.load(result.data);
                // remove style
                $('img, div, span, p, table, td, tr').removeAttr('style');
                $('style, script').remove();

                return $('.v_news_content')
                    .html()
                    .replace(/(<span[^>]*>|<\/span>)/g, '');
            });

            const rssitem = {
                title: $('title').text().split('-')[0],
                description,
                link: item_link,
                author: '辽宁工程技术大学教务处',
            };
            return Promise.resolve(rssitem);
        })
    );

    ctx.state.data = {
        title: '辽宁工程技术大学教务公告',
        link,
        item: res,
    };
};
