const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const category_param = ctx.params.category || 'news_list';
    const categories = category_param.split('+');
    const baseUrl = 'https://www.mcdonalds.com.cn/news/';

    const get_news_list = async (cates) =>
        await Promise.all(
            cates.map(async (cate) => {
                const response = await got.get(baseUrl + cate);
                const $ = cheerio.load(response.data);
                // console.log($('title').text());
                const news = $('.news_list .box-container > div')
                    .slice(0, 10)
                    .map((idx, item) => {
                        item = $(item);
                        return item.find('a[target]').attr('href');
                    })
                    .get();
                // console.log(news);
                return Promise.resolve(news);
            })
        );
    const all_news = [].concat.apply([], await get_news_list(categories));

    const out = await Promise.all(
        all_news.map(async (news_url) => {
            const news_detail = await ctx.cache.tryGet(news_url, async () => {
                const result = await got.get(news_url);
                const $ = cheerio.load(result.data);

                //                 console.log($('h3 ~ time').text(), news_url);

                return {
                    title: $('h3').text(),
                    link: news_url,
                    // author: author,
                    pubDate: new Date($('h3 ~ time').text()).toUTCString(),
                    description: $('.cmsPage').html(),
                };
            });
            return Promise.resolve(news_detail);
        })
    );

    ctx.state.data = {
        title: '麦当劳资讯',
        link: baseUrl,
        item: out,
    };
};
