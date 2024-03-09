const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://api.xiaoheihe.cn/maxnews/app/list?tag=-1&offset=0&limit=30&rec_mark=timeline&heybox_id=12777814&imei=867252032615972&os_type=Android&os_version=9&version=1.1.55&_time=1551801017&hkey=b28cd7a1cba463b4d9176ba2f8f42d35`,
    });
    const data = response.data.result.filter((item) => item.content_type !== 7);

    const result = await Promise.all(
        data.map(async (item) => {
            const newsId = item.newsid;
            const cacheKey = `xiaoheihe_${newsId}`;

            // 最终需要返回的对象
            const news = {
                title: item.title,
                pubDate: item.data,
                link: `https://api.xiaoheihe.cn/maxnews/app/share/detail/${newsId}`,
                guid: cacheKey,
            };

            // 判断缓存中是否存在
            const cacheValue = await ctx.cache.get(cacheKey);
            if (cacheValue) {
                news.description = cacheValue;
            } else {
                const newsUrl = `https://api.xiaoheihe.cn/maxnews/app/detail/${newsId}?from_tag=-1&newsid=${newsId}&rec_mark=timeline&pos=2&index=1&page_tab=1&from_recommend_list=3&h_src=LTE%3D&os_type=Android&os_version=9&hkey=c25f13a25787311aca69d031280f4682&imei=867252032615972&version=1.2.57&_time=1552533062&heybox_id=12777814`;
                const article = await got({
                    method: 'get',
                    url: newsUrl,
                });
                // 解析html内容
                const $ = cheerio.load(article.data);
                const content = $('.article-content').html().replaceAll('data-original', 'src');
                // 存放到缓存区
                ctx.cache.set(cacheKey, content);
                news.description = content;
            }

            return news;
        })
    );

    ctx.state.data = {
        title: `小黑盒游戏新闻`,
        link: `https://xiaoheihe.cn/community/index`,
        item: result,
    };
};
