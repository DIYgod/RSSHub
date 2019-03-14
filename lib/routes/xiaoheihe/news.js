const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: `https://api.xiaoheihe.cn/maxnews/app/list?tag=-1&offset=0&limit=30&rec_mark=timeline&heybox_id=12777814&imei=867252032615972&os_type=Android&os_version=9&version=1.1.55&_time=1551801017&hkey=b28cd7a1cba463b4d9176ba2f8f42d35`,
    });
    const data = response.data.result.filter((item) => item.content_type != 7);

    const result = await Promise.all(data.map(async (item) => {
        const newsUrl = `https://api.xiaoheihe.cn/maxnews/app/detail/${item.newsid}?from_tag=-1&newsid=${item.newsid}&rec_mark=timeline&pos=2&index=1&page_tab=1&from_recommend_list=3&h_src=LTE%3D&os_type=Android&os_version=9&hkey=c25f13a25787311aca69d031280f4682&imei=867252032615972&version=1.2.57&_time=1552533062&heybox_id=12777814`;
        const article = await axios({
            method: 'get',
            url: newsUrl
        });
        const $ = cheerio.load(article.data);
        return Promise.resolve({
            title: item.title,
            description: $('.article-content').html(),
            pubDate: item.date,
            link: item.newUrl
        });
    }));
    
    ctx.state.data = {
        title: `小黑盒游戏新闻`,
        link: `https://xiaoheihe.cn/community/index`,
        item: result
    };
};
