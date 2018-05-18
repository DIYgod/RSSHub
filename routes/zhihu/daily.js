const axios = require('axios');
const config = require('../../config');

// 参考：https://github.com/izzyleung/ZhihuDailyPurify/wiki/%E7%9F%A5%E4%B9%8E%E6%97%A5%E6%8A%A5-API-%E5%88%86%E6%9E%90
// 文章给出了v4版 api的信息，包含全文api

module.exports = async (ctx) => {
    const listRes = await axios({
        method: 'get',
        url: 'https://news-at.zhihu.com/api/4/news/latest',
        headers: {
            'User-Agent': config.ua,
            Referer: 'https://news-at.zhihu.com/api/4/news/latest',
        },
    });
    // 根据api的说明，过滤掉极个别站外链接
    const storyList = listRes.data.stories.filter((el) => el.type === 0);
    const resultItem = [];
    for (let i = 0; i < storyList.length; i++) {
        const url = 'https://news-at.zhihu.com/api/4/news/' + storyList[i].id;
        const item = {
            title: storyList[i].title,
            description: '',
            link: url,
        };
        const key = 'daily' + storyList[i].id;
        const value = await ctx.cache.get(key);

        if (value) {
            item.description = value;
        } else {
            const storyDetail = await axios({
                method: 'get',
                url: url,
                headers: {
                    'User-Agent': config.ua,
                    Referer: url,
                },
            });
            item.description = storyDetail.data.body;
            ctx.cache.set(key, storyDetail.data.body, 24 * 60 * 60);
        }

        resultItem.push(item);
    }

    ctx.state.data = {
        title: '知乎日报',
        link: 'https://daily.zhihu.com',
        description: '每天3次，每次7分钟',
        item: resultItem,
    };
};
