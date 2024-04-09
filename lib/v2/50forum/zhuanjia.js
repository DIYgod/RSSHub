const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const rootUrl = 'http://www.50forum.org.cn';
    const response = await got({
        method: 'get',
        url: `${rootUrl}/home/article/index/category/zhuanjia.html`,
    });
    const data = response.data;
    if (!data) {
        return;
    }
    const $ = cheerio.load(data);
    let out = $('div.container div.list_list.mtop10 ul li')
        .find('a')
        .toArray()
        .map((item) => {
            item = $(item);
            const link = rootUrl + item.attr('href');
            const reg = /^(.+)\[(.*)\](.+)$/;
            const keyword = reg.exec(item.text().trim());
            return {
                title: keyword[1],
                author: keyword[2],
                link,
            };
        });

    out = await Promise.all(
        out.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const result = await got(item.link);

                const $ = cheerio.load(result.data);

                item.description = $('div.list_content').html();
                item.pubDate = timezone(parseDate($('span#publish_time').text(), 'YYYY-MM-DD HH:mm'), +8);
                return item;
            })
        )
    );
    ctx.state.data = {
        title: `中国经济50人论坛专家文章`,
        link: 'http://www.50forum.org.cn/home/article/index/category/zhuanjia.html',
        description: '中国经济50人论坛专家文章',
        item: out,
    };
};
