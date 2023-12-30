const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootApiUrl = 'https://www.lifeweek.com.cn/api/userWebFollow/getFollowTagContentList?type=3&sort=2&tagId';
const rootUrl = 'https://www.lifeweek.com.cn/column';
const articleRootUrl = 'https://www.lifeweek.com.cn/article';
const articleApiRootUrl = 'https://www.lifeweek.com.cn/api/article';
module.exports = async (ctx) => {
    const channel = ctx.params.id;
    const url = `${rootApiUrl}=${channel}`;
    const { data } = await got(url);
    const result = data.model.articleResponseList;
    const items = await Promise.all(
        result.map((item) => {
            const articleLink = `${articleRootUrl}/${item.id}`;
            const articleApiLink = `${articleApiRootUrl}/${item.id}`;
            return ctx.cache.tryGet(articleApiLink, async () => {
                const { data } = await got(articleApiLink);
                const time = timezone(parseDate(item.pubTime), +8);
                return {
                    title: item.title,
                    description: data.model.content,
                    link: articleLink,
                    pubDate: time,
                };
            });
        })
    );

    ctx.state.data = {
        title: data.model.tagName,
        link: `${rootUrl}/${channel}`,
        item: items,
    };
};
