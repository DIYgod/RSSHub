const got = require('@/utils/got');

module.exports = async (ctx) => {
    const categoryUuid = ctx.params.categoryUuid || '33b67d1bad1d4e37812f71d42764af34';
    const recommend = ctx.params.recommend || 0;

    const title = {
        '02fdcc2ab6374bc6b9b9717e70c87723': '生活',
        '5af4bca5496e4733a2d582690627e25f': '工作',
        '33b67d1bad1d4e37812f71d42764af34': '热门',
        '73d89972bee0457997c983d7fca19f9f': '服务发布',
        '437d434fe9eb410a94dcefb889994e2b': '互联网',
        '853ce8b3a4c24b87a03f66af95c5e06c': '医疗',
        '959c81f606ca495c882c7e461429eb2a': '语言',
        '9747cbf78f96492c973aa6ab23925eee': '教育',
        '58231ab9cef34af7819c3f6e2160c007': '行业',
        '820156a42e9a490796c7fd56916aa95b': '学习',
        '5300988dff564756b5d462cea8a865b7': '提升',
        '9434268e893a46aa9a1a231059849984': '学科',
        d4c3a92a9cf64da7b187763211dc6ff6: '其他',
    };

    const response = await got.get(`https://zhimap.com/restful/pub/publication/list?categoryUuid=${categoryUuid}&recommend=${recommend}&page=0&size=10`);

    const item = response.data.data.content.map((item) => ({
        author: item.author.nickname,
        title: item.publicationInfo.abstracts,
        pubDate: new Date(item.mindMap.createTime),
        link: `https://zhimap.com/mmap/${item.mindMap.uuid}`,
    }));

    ctx.state.data = {
        title: `Zhimap 知识导图社区 - ${title[categoryUuid]}`,
        link: `https://zhimap.com/gallery`,
        item,
    };
};
