const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';
    const keyword = ctx.params.keyword ?? '';
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 100;

    const rootUrl = 'https://community.aqara.com';
    const apiUrl = `${rootUrl}/api/v2/feeds?limit=${limit}&platedetail_id=${id}&keyword=${keyword}&all=1`;
    const currentUrl = `${rootUrl}/pc/#/post${id ? `?id=${id}` : ''}`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.map((item) => ({
        title: item.feed_title,
        link: `${rootUrl}/pc/#/post/postDetail/${item.id}`,
        description: item.feed_content,
        pubDate: parseDate(item.created_at),
        author: item.user.nickname,
    }));

    ctx.state.data = {
        title: 'Aqara社区',
        link: currentUrl,
        item: items,
        allowEmpty: true,
    };
};
