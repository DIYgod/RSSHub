const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.shanghaitech.edu.cn/qb/list.htm';
    const response = await got({ method: 'get', url: link });

    const $ = cheerio.load(response.data);

    const list = $('ul.news_list.clearfix li')
        .map((i, e) => ({
            link: `http://www.shanghaitech.edu.cn` + $(e).find('a').attr('href'),
            title: $(e).find('a').text(),
            pubDate: $(e).find('div.news_time').attr('data-time'),
        }))
        .get();

    ctx.state.data = {
        title: '上海科技大学 - 活动',
        link,
        item: await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    if (item.link.indexOf('_redirect?') === -1) {
                        const detailResponse = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(detailResponse.data);
                        item.description = content('div.wp_articlecontent').html();
                    }
                    return item;
                })
            )
        ),
    };
};
