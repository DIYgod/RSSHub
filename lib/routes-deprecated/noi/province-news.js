const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://www.noi.cn/gs/xw/index.shtml`,
    });
    const $ = cheerio.load(response.data);
    const postList = $('.news-all').find('.news-item').get();
    const result = await Promise.all(
        postList.map(async (item) => {
            const title = $(item).find('a').text();
            const link = 'http://www.noi.cn' + $(item).find('a').attr('href');
            const guid = link;
            const pubDate = new Date($(item).find('small').text().slice(-19)).toUTCString();

            const single = {
                title,
                link,
                guid,
                pubDate,
                description: '',
            };

            const description_key = 'noi' + guid;
            const description_value = await ctx.cache.get(description_key);

            if (description_value) {
                single.description = description_value;
            } else {
                const temp = await got(link);
                single.description = $(temp.data).find('.news-cont').html();
                ctx.cache.set(description_key, single.description);
            }
            return single;
        })
    );
    ctx.state.data = { title: '各省新闻 - NOI 全国青少年信息学奥林匹克竞赛', link: 'http://www.noi.cn/articles.html?type=99', item: result };
};
