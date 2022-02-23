const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const userUrl = `https://36kr.com/user/${ctx.params.uid}`;
    const response = await got({
        method: 'get',
        url: userUrl,
    });
    const data = JSON.parse(response.data.match(/"authorDetailData":(.*?),"channel":/)[1]);

    const authorInfo = data.authorInfo.data;
    const authorFlowList = data.authorFlowList.data.itemList;
    const articleList = authorFlowList.map((item) => ({
        title: item.templateMaterial.widgetTitle,
        link: `https://36kr.com/${item.route.split('?')[0] === 'detail_video' ? 'video' : 'p'}/${item.itemId}`,
        pubDate: parseDate(item.templateMaterial.publishTime),
    }));

    ctx.state.data = {
        title: `36氪用户 - ${authorInfo.userNick}`,
        link: userUrl,
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
        description: `${authorInfo.label} | ${authorInfo.summary}`,
    };
};
