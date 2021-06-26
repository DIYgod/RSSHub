const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = 'https://www2.scut.edu.cn';
    const url = `${rootUrl}/ee/16285/list.htm`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const list = $('.news_ul li');
    const articleList = list.map((_, item) => {
        item = $(item);
        const titleElement = item.find('.news_title a');
        return {
            title: titleElement.attr('title'),
            link: titleElement.attr('href'),
            pubDate: parseDate(item.find('.news_meta').text(), 'YYYY-MM-DD'),
        };
    }).get();

    const items = await Promise.all(
        articleList.map(async (item) =>
            await ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${rootUrl}${item.link}`,
                });
                const content = cheerio.load(detailResponse.data);

                content('.wp_articlecontent *').each((_, child) => {
                    if (content(child).text().replace('\n', '').trim().length) {
                        content(child).removeAttr('style');
                        content(child).removeAttr('lang');
                    } else {
                        if (!content(child).find('img')) {
                            content(child).remove();
                        }
                    }
                });

                item.description = content('.wp_articlecontent')
                    .contents()
                    .map((_, child) => content(child).html())
                    .get()
                    .join();

                item.description = content('.wp_articlecontent').html();
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
