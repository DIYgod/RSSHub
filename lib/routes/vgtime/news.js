const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://www.vgtime.com/vgtime-app/api/v2/homepage/listByTag.json?page=1&pageSize=20&tags=1`,
    });
    const data = response.data.data.topicList;

    const result = await Promise.all(
        data.map(async (item) => {
            const postId = item.postId;
            const cacheKey = `vgtime_${postId}`;

            // 最终需要返回的对象
            const news = {
                title: item.title || item.text,
                author: item.author || item.user.name,
                pubDate: new Date(item.publishDate * 1000).toUTCString(),
                link: item.shareUrl,
            };

            // 判断缓存中是否存在
            const cacheValue = await ctx.cache.get(cacheKey);
            if (cacheValue) {
                news.description = cacheValue;
            } else {
                const article = await got({
                    method: 'get',
                    url: `https://www.vgtime.com/topic/${postId}.jhtml`,
                });
                // 解析html内容
                const $ = cheerio.load(article.data);
                $('h1.art_tit').remove();
                $('.editor_name').remove();
                const content = $('.vg_main article').html();
                // 存放到缓存区
                ctx.cache.set(cacheKey, content);
                news.description = content;
            }

            return Promise.resolve(news);
        })
    );

    ctx.state.data = {
        title: `游戏时光新闻列表`,
        link: `http://www.vgtime.com/topic/index.jhtml`,
        item: result,
    };
};
