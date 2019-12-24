const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got('https://wen.woshipm.com/m/main/indexNewData.html');
    const $ = cheerio.load(response.data);
    const postList = $('.article-list-item').get();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item)
                .find('.went-head-text')
                .text();
            const link =
                'https://wen.woshipm.com/' +
                $(item)
                    .find('.went-head')
                    .attr('href');
            const pubDate = new Date().toUTCString();

            const single = {
                title: title,
                link: link,
                guid: link,
                pubDate: pubDate,
                description: '',
            };

            const key = link;
            const value = await ctx.cache.get(key);

            if (value) {
                single.description = value;
            } else {
                const temp = await got(link);
                const $ = cheerio.load(temp.data);
                single.description = $('.wt-desc').html();

                ctx.cache.set(key, single.description);
            }

            return Promise.resolve(single);
        })
    );
    ctx.state.data = { title: '天天问 - 人人都是产品经理', link: 'http://wen.woshipm.com/', item: result };
};
