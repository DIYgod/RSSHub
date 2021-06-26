const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www2.scut.edu.cn';
    const url = `${rootUrl}/ee/16285/list.htm`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const list = $('.news_ul li');
    const articleList = list
        .map((_, item) => {
            item = $(item);
            const titleElement = item.find('.news_title a');
            return {
                title: titleElement.attr('title'),
                link: titleElement.attr('href'),
                pubDate: parseDate(item.find('.news_meta').text(), 'YYYY-MM-DD'),
            };
        })
        .get();

    const items = await Promise.all(
        articleList.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: `${rootUrl}${item.link}`,
                    });
                    const content = cheerio.load(detailResponse.data, { decodeEntities: false });

                    content('.wp_articlecontent *').each((_, child) => {
                        const childElem = content(child);
                        childElem.removeAttr('style');
                        childElem.removeAttr('lang');
                        childElem.removeAttr('original-src');
                        childElem.removeAttr('sudyfile-attr');
                        childElem.removeAttr('data-layer');
                        if ((!childElem.text().replace('\n', '').trim().length && !childElem.has('img')) || childElem.attr('name') === '_GoBack' || childElem.is('style')) {
                            childElem.remove();
                        }
                    });
                    const contents = content('.wp_articlecontent').contents();

                    item.description = contents
                        .map((_, child) => content(child).html())
                        .get()
                        .join('')
                        .trim()
                        .replace(/^(<br>)+|(<br>)+$/g, '')
                        .trim();

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: '华南理工大学电子与信息学院 - 新闻速递',
        link: url,
        item: items,
    };
};
