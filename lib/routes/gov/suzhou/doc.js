const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.suzhou.gov.cn/szxxgk/front/xxgk_right.jsp';
    const response = await got.get(link);
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.tr_main_value_odd');

    ctx.state.data = {
        title: '苏州市政府 - 政策公开文件',
        link: link,
        item: await Promise.all(
            list
                .slice(0, 12)
                .map(async (index, item) => {
                    item = $(item);
                    // 获取全文
                    const contentUrl = 'http://www.suzhou.gov.cn' + item.find('a').attr('href');
                    const arr = await ctx.cache.tryGet(contentUrl, async () => {
                        const fullText = await got.get(contentUrl);
                        const fullTextData = cheerio.load(fullText.data);
                        fullTextData('.article-extended').remove();
                        fullTextData('#shareNode').remove();
                        fullTextData('.article-auxiliary').remove();
                        const description = fullTextData('.contentShow').html()
                            ? fullTextData('.contentShow').html()
                            : fullTextData('.mb')
                                  .html()
                                  .replace(/<.?ucaptitle>/g, '')
                                  .replace(/<.?ucapcontent>/g, '')
                                  .replace(/"\/szsrmzf/g, '"http://www.suzhou.gov.cn/szsrmzf')
                                  .replace('publishtime', 'span');
                        const title = fullTextData('h1').text().replace(/\s*/g, '');
                        return new Array(title, description);
                    });
                    return {
                        title: arr[0],
                        description: arr[1],
                        pubDate: item.find('td:nth-child(4)').text(),
                        link: contentUrl,
                    };
                })
                .get()
        ),
    };
};
