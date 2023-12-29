const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const rootUrl = 'https://www.lifeweek.com.cn/api/userWebFollow/getFollowTagContentList?type=3&sort=2&tagId';
const articleRootUrl = 'https://www.lifeweek.com.cn/article';
const articleApiRootUrl = 'https://www.lifeweek.com.cn/api/article';
module.exports = async (ctx) => {
    const channel = ctx.params.id;
    const url = `${rootUrl}=${channel}`;
    const { data } = await got(url);
    const result = data.model.articleResponseList;
    const items = await Promise.all(
        result.map((item) => {
            const articleLink = `${articleRootUrl}/${item.id}`;
            const articleApiLink = `${articleApiRootUrl}/${item.id}`;
            return ctx.cache.tryGet(articleApiLink, async () => {
                const { data } = await got(articleApiLink, {
                    responseType: 'buffer',
                });
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
        link: url,
        item: items,
    };
};
