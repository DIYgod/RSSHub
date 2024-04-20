const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = 'https://mainssl.geekpark.net/api/v1/posts';
    const link = 'https://www.geekpark.net';

    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data.posts;

    ctx.state.data = {
        title: '极客公园 - 资讯',
        description:
            '极客公园聚焦互联网领域，跟踪最新的科技新闻动态，关注极具创新精神的科技产品。目前涵盖前沿科技、游戏、手机评测、硬件测评、出行方式、共享经济、人工智能等全方位的科技生活内容。现有前沿社、挖App、深度报道、极客养成指南等多个内容栏目。',
        link,
        item: data.map(({ title, content, published_at, id }) => ({
            title,
            link: `https://www.geekpark.net/news/${id}`,
            description: content,
            pubDate: new Date(published_at).toUTCString(),
        })),
    };
};
