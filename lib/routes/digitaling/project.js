const cheerio = require('cheerio');
const got = require('@/utils/got');

// 分类标题
const categoryTitle = new Map([
    ['all', { name: '全部' }],
    ['weekly', { name: '每周项目精选' }],
    ['monthly', { name: '每月项目精选' }],
    ['international', { name: '海外项目精选' }],
    ['hot', { name: '近期热门项目' }],
    ['favorite', { name: '近期最多收藏' }],
]);

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const link = `https://www.digitaling.com/projects/${category}`;
    const res = await got.get(link);
    const $ = cheerio.load(res.data);
    // 标题
    const title = categoryTitle.get(category).name;
    // 文章列表
    const list = $('#pro_list .works_title h3')
        .find('a')
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list.map(async (itemUrl) => {
            const cache = await ctx.cache.get(itemUrl);
            // 判断缓存
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(itemUrl);
            const $ = cheerio.load(res.data);

            const item = {
                title: $('.clearfix h2').text(),
                author: $('#avatar_by').find('a').text(),
                link: itemUrl,
                description: $('#article_con').html(),
                pubDate: new Date().toUTCString(),
            };
            ctx.cache.set(itemUrl, JSON.stringify(item));

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `数英网-项目专题-${title}`,
        link: link,
        item: out,
    };
};
