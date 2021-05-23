const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got('https://www.ui.cn/');
    const $ = cheerio.load(response.data);
    const postList = $('#article').find('.h-article-list').find('li').get();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item).find('.ellipsis').text();
            const link = 'https://www.ui.cn' + $(item).find('.ellipsis').attr('href');
            const guid = link;

            const single = {
                title: title,
                link: link,
                guid: guid,
                pubDate: '',
                description: '',
            };

            const description_key = 'ui-cn_description' + guid;
            const description_value = await ctx.cache.get(description_key);

            const pubDate_key = 'ui-cn_pubDate' + guid;
            const pubDate_value = await ctx.cache.get(pubDate_key);

            if (description_value && pubDate_value) {
                single.description = description_value;
                single.pubDate = pubDate_value;
            } else {
                const temp = await got(link);
                single.description = $(temp.data).find('.works-cont').html();
                single.pubDate = new Date($(temp.data).find('.works-top').find('.time').find('em').text().replace(/更新于：/g, '')).toUTCString();

                ctx.cache.set(description_key, single.description);
                ctx.cache.set(pubDate_key, single.pubDate);
            }

            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '推荐文章 - UI 中国', link: 'https://www.ui.cn/', item: result };
};
