const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const motifUrl = `https://36kr.com/motif/${ctx.params.mid}`;
    const response = await got({
        method: 'get',
        url: motifUrl,
    });
    const data = JSON.parse(response.data.match(/"motifDetailData":{"code":0,"data":(.*?)},"channel":/)[1]);

    const motifInfo = data.motifInfo.data;
    const motifArticleList = data.motifArticleList.data.itemList;
    const articleList = motifArticleList.map((item) => ({
        title: item.templateMaterial.widgetTitle,
        link: `https://36kr.com/p/${item.itemId}`,
        pubDate: new Date(item.templateMaterial.publishTime).toUTCString(),
    }));

    ctx.state.data = {
        title: `36氪专题 - ${motifInfo.categoryTitle}`,
        link: motifUrl,
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
        description: `${motifInfo.categoryTitle}`,
    };
};
