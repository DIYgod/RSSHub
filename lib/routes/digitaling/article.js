const cheerio = require('cheerio');
const got = require('@/utils/got');

// 分类标题
const categoryTitle = new Map([
    ['latest', { name: '最新文章', type: {} }],
    ['headline', { name: '头条', type: {} }],
    [
        'hot',
        {
            name: '热文',
            type: {
                views: '近期热门文章',
                collects: '近期最多收藏',
                zan: '近期最多赞',
            },
        },
    ],
    ['choice', { name: '精选', type: {} }],
]);
module.exports = async (ctx) => {
    let category = ctx.params.category || 'latest';
    const subcate = ctx.params.subcate;
    // 获取分类标题
    let title = categoryTitle.get(category).name;
    if (category === 'latest') {
        // 获取最新文章
        category = '';
    }
    let link = `https://www.digitaling.com/articles/${category}/`;
    // 二级子分类
    if (subcate !== undefined) {
        link = link + subcate;
        title = title + '/' + categoryTitle.get(category).type[subcate];
    }
    const res = await got.get(link);
    const $ = cheerio.load(res.data);
    // 文章列表
    const list = $('.con_list li h3')
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

            return item;
        })
    );

    ctx.state.data = {
        title: `数英网-文章专题-${title}`,
        link,
        item: out,
    };
};
