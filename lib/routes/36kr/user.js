const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const userUrl = `https://36kr.com/user/${ctx.params.uid}`;
    const response = await got({
        method: 'get',
        url: userUrl,
    });
    const data = JSON.parse(response.data.match(/"authorDetailData":{"code":0,"data":(.*?)},"channel":/)[1]);

    const authorInfo = data.authorInfo.data;
    const authorArticleList = data.authorArticleList.data.itemList;
    const articleList = authorArticleList.map((item) => ({
        title: item.templateMaterial.widgetTitle,
        link: `https://36kr.com/p/${item.itemId}`,
        pubDate: new Date(item.templateMaterial.publishTime).toUTCString(),
    }));

    ctx.state.data = {
        title: `36氪用户 - ${authorInfo.userNick}`,
        link: userUrl,
        item: await Promise.all(
            articleList.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const contentResponse = await got({ method: 'get', url: item.link });
                        const content = cheerio.load(contentResponse.data);
                        item.description = content('div.common-width.content.articleDetailContent.kr-rich-text-wrapper').html();
                        return item;
                    })
            )
        ),
        description: `${authorInfo.label} | ${authorInfo.summary}`,
    };
};
