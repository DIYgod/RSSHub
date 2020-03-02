const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.suzhou.gov.cn/szxxgk/front/xxgk_right.jsp?sitecode=szsrmzf';
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
                        const description = fullTextData('.content').html();
                        const title = fullTextData('.title.bold')
                            .text()
                            .replace(/\s*/g, '');
                        return new Array(title, description);
                    });
                    return {
                        title: arr[0],
                        description: arr[1],
                        link: contentUrl,
                    };
                })
                .get()
        ),
    };
};
