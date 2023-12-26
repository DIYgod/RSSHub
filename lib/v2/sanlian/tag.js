const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const util = require('@/v2/nintendo/utils');

const rootUrl = 'https://www.lifeweek.com.cn/articleList';
const articleRootUrl = 'https://www.lifeweek.com.cn/article';
module.exports = async (ctx) => {
    const tag = ctx.params.id;
    const url = `${rootUrl}/${tag}`;
    const response = await got(url, {
        responseType: 'buffer',
    });
    const result = await util.nuxtReader(response.data);
    if (!result.articleList) {
        throw new Error('新闻信息不存在，请报告这个问题');
    }
    const items = await Promise.all(
        result.articleList.map((item) => {
            const articleLink = `${articleRootUrl}/${item.id}`;
            return ctx.cache.tryGet(articleLink, async () => {
                const response = await got(articleLink, {
                    responseType: 'buffer',
                });
                const articleResult = await util.nuxtReader(response.data);
                const time = timezone(parseDate(item.pubTime), +8);
                return {
                    title: item.title,
                    description: articleResult.articleDetail.content,
                    link: articleLink,
                    pubDate: time,
                };
            });
        })
    );

    ctx.state.data = {
        title: result.tagInfo.tagName,
        link: url,
        item: items,
    };
};
