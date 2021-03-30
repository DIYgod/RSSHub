const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://www.50forum.org.cn/home/article/index/category/zhuanjia.html`,
    });
    const data = response.data;
    if (!data) {
        return;
    }
    const $ = cheerio.load(data);
    const article_list = $('div.container div.list_list.mtop10 ul li a').toArray();

    const out = await Promise.all(
        article_list.map(async (article) => {
            const $item = $(article);
            const link = 'http://www.50forum.org.cn' + $item.attr('href');
            const reg = /^(.+)\[(.+)\](.+)$/;
            const keyword = reg.exec($item.text().trim());

            const description = await ctx.cache.tryGet(link, async () => {
                const result = await got.get(link);

                const $ = cheerio.load(result.data);

                return $('div.list_content').html();
            });

            const item = {
                description,
                title: keyword[1],
                author: keyword[2],
                link,
                pubDate: keyword[3],
            };
            return Promise.resolve(item);
        })
    );
    ctx.state.data = {
        title: `中国经济50人论坛专家文章`,
        link: 'http://www.50forum.org.cn/home/article/index/category/zhuanjia.html',
        description: '中国经济50人论坛专家文章',
        item: out,
    };
};
