const got = require('@/utils/got');

module.exports = async (ctx) => {
    const categoryUuid = ctx.params.categoryUuid || '33b67d1bad1d4e37812f71d42764af34';
    const recommend = ctx.params.recommend || 0;
    const response = await got.get(`https://zhimap.com/restful/pub/publication/list?categoryUuid=${categoryUuid}&recommend=${recommend}&page=0&size=10`);

    const item = response.data.data.content.map((item) => ({
        author: item.author.nickname,
        title: item.publicationInfo.abstracts,
        pubDate: new Date(item.mindMap.createTime),
        link: `https://zhimap.com/mmap/${item.mindMap.uuid}`,
    }));

    ctx.state.data = {
        title: 'Zhimap 知识导图社区',
        link: `https://zhimap.com/gallery`,
        item,
    };
};
