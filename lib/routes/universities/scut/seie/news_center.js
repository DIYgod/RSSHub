const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www2.scut.edu.cn';
    const url = `${rootUrl}/ee/16285/list.htm`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const list = $('.news_ul li');
    const items = await Promise.all(
        list
            .map(async (_, elem) => {
                elem = $(elem);
                const titleElem = elem.find('.news_title a');
                const link = new URL(titleElem.attr('href'), rootUrl).href;
                const item = { link, title: titleElem.attr('title') };

                return await ctx.cache.tryGet(link, async () => {
                    const detailResponse = await got(link);
                    const content = cheerio.load(detailResponse.data);
                    content('.wp_articlecontent *').each((_, child) => {
                        if (!content(child).text().replace('\n', '').trim().length) {
                            content(child).remove();
                        } else {
                            content(child).removeAttr('style');
                            content(child).removeAttr('lang');
                        }
                    });
                    item.description = content('.wp_articlecontent')
                        .contents()
                        .map((_, child) => content(child).html())
                        .get()
                        .join();
                    item.pubDate = parseDate(content('.arti_update').text(), 'YYYY-MM-DD');

                    return item;
                });
            })
            .get()
    );

    ctx.state.data = {
        title: '华南理工大学电子与信息学院 - 新闻速递',
        link: url,
        item: items,
    };
};
