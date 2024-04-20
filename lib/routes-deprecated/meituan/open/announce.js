const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://developer.meituan.com/api/v1/announcement/menu-page?docKey=anno-all&pageSize=100&pageNum=1',
    });
    const docList = response.data.data.docList;

    const url = 'https://developer.meituan.com/api/v1/doc/content';

    // https://developer.meituan.com/api/v1/doc/content?docKey=announcement-468
    const articleList = await Promise.all(
        docList.map(async (item) => {
            const articleUrl = `${url}?docKey=${item.docKey}`;
            const cacheKey = `${articleUrl}_${item.modifyTime}`;

            const cache = await ctx.cache.get(cacheKey);
            if (cache) {
                return JSON.parse(cache);
            } else {
                const articleResp = await got.get(articleUrl);
                const article = {
                    title: item.title,
                    link: `https://developer.meituan.com/isv/announcement/detail?dockey=anno-all&id=${item.docKey}`,
                    description: articleResp.data.data.docDataItemDtos[0].content,
                    pubDate: item.modifyTime,
                };
                ctx.cache.set(cacheKey, JSON.stringify(article));
                return article;
            }
        })
    );

    ctx.state.data = {
        title: '美团开放平台-公告',
        link: 'https://developer.meituan.com/isv/announcement/list',
        item: articleList.map((item) => ({
            title: item.title,
            description: item.description,
            pubDate: item.modifyTime,
            link: item.link,
        })),
    };
};
