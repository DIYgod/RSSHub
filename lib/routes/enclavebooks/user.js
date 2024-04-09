const got = require('@/utils/got');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;

    const authorUrl = 'https://app.enclavebooks.cn/v2/getOtherUserInformation?otherUserId%5B%5D=' + uid;
    const authorResponse = await got(authorUrl);
    const autherName = authorResponse.data.result[0].nickname;

    const url = 'https://app.enclavebooks.cn/v2/writeListByOther?page=1&otherUserId=' + uid;
    const response = await got({ method: 'get', url });
    const responseList = response.data.result.data;

    const list = responseList.map((item) => ({
        artId: item.artId,
        title: item.artTitle,
        description: item.artDescription,
        pubDate: new Date(item.artTime * 1000).toUTCString(),
        link: `http://www.enclavebooks.cn/article.html?art_id=${item.artId}`,
    }));

    const result = await Promise.all(
        list.map(async (item) => {
            const link = 'https://app.enclavebooks.cn/v2/article?id=' + item.artId;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(link);
            item.description = itemReponse.data.result.artContent;

            ctx.cache.set(link, JSON.stringify(item));
            return item;
        })
    );

    ctx.state.data = {
        title: '飞地 - ' + autherName,
        link: url,
        item: result,
    };
};
