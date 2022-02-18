const got = require('@/utils/got');

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
        link: `https://36kr.com/${item.route.split('?')[0] === 'detail_video' ? 'video' : 'p'}/${item.itemId}`,
        pubDate: new Date(item.templateMaterial.publishTime).toUTCString(),
    }));

    ctx.state.data = {
        title: `36氪专题 - ${motifInfo.categoryTitle}`,
        link: motifUrl,
        item: await Promise.all(
            articleList.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const contentResponse = await got({ method: 'get', url: item.link });
                    const result = contentResponse.data.match(/"articleDetailData":(.*?),"articleRecommendData":/) || contentResponse.data.match(/"videoDetail":(.*?),"authorVideos":/);
                    const contentData = JSON.parse(result[1]);
                    item.description = contentData.data.widgetContent;
                    return item;
                })
            )
        ),
        description: motifInfo.categoryTitle,
    };
};
