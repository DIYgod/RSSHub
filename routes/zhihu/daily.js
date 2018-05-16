const axios = require('axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const today = await axios({
        method: 'get',
        url: 'https://news-at.zhihu.com/api/2/news/latest', // 旧版api，可以获取文章的url。参考：https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90
        headers: {
            'User-Agent': config.ua,
            'Referer': 'https://daily.zhihu.com' // 不知道应该写什么比较好，随便写一个吧
        }
    });
    const d = new Date();
    // todayfmt: YYYYMMDD
    const todayfmt = `${d.getFullYear()}${d.getMonth() > 8 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)}${d.getDate()}`;

    const yesterday = await axios({
        method: 'get',
        url: `https://news-at.zhihu.com/api/2/news/before/${todayfmt}`, // 旧版api，可以获取文章的url。参考：https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90
        headers: {
            'User-Agent': config.ua,
            'Referer': 'https://daily.zhihu.com'
        }
    });

    const items = today.data.news.concat(yesterday.data.news);

    ctx.state.data = {
        title: '知乎日报',
        link: 'https://daily.zhihu.com',
        description: '每天3次，每次7分钟',
        item: items.map((item) => {
            return {
                title: item.title,
                description: `<img referrerpolicy="no-referrer" src='${item.image}'/>`, // 暂时没有找到包含正文的api，所以就放一张图吧
                link: item.share_url
            };
        }),
    };
};
