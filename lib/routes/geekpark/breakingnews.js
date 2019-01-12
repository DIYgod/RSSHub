const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const url = 'https://digestapit.geeks.vc/v1/articles';
    const link = 'https://www.geekpark.net/breakingnews';

    const response = await axios({
        method: 'get',
        url,
    });
    const data = response.data.data.reverse();

    ctx.state.data = {
        title: '全球快讯 | 极客公园',
        description:
            '极客公园聚焦互联网领域，跟踪最新的科技新闻动态，关注极具创新精神的科技产品。目前涵盖前沿科技、游戏、手机评测、硬件测评、出行方式、共享经济、人工智能等全方位的科技生活内容。现有前沿社、挖App、深度报道、极客养成指南等多个内容栏目。',
        link,
        item: data.map(({ url, edited_title, summary, published, _id }) => ({
            title: edited_title,
            description: summary,
            link: url,
            pubDate: new Date(published).toUTCString(),
            guid: _id,
        })),
    };
};
