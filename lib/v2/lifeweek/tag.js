const got = require('@/utils/got');
const getRssItem = require('./utils');
const rootApiUrl = 'https://www.lifeweek.com.cn/api/userWebFollow/getFollowTagContentList?type=4&sort=2&tagId';
const rootUrl = 'https://www.lifeweek.com.cn/articleList';
const articleRootUrl = 'https://www.lifeweek.com.cn/article';

module.exports = async (ctx) => {
    const tag = ctx.params.id;
    const url = `${rootApiUrl}=${tag}`;
    const { data } = await got(url);
    const result = data.model.articleResponseList;
    const items = await Promise.all(
        result.map((item) => {
            const articleLink = `${articleRootUrl}/${item.id}`;
            return ctx.cache.tryGet(articleLink, () => getRssItem(item, articleLink));
        })
    );

    ctx.state.data = {
        title: data.model.tagName,
        link: `${rootUrl}/${tag}`,
        item: items,
    };
};
