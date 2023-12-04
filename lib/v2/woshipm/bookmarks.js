const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, parseArticle } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const { data: profile } = await got(`${baseUrl}/api2/user/profile`, {
        searchParams: {
            uid: id,
        },
    });
    const userInfo = profile.RESULT.userInfoVo;
    const name = userInfo.nickName;

    const remark_api = `${baseUrl}/__api/v1/users/${id}/bookmarks`;
    const response_api = await got(remark_api);
    const list = response_api.data.payload.value.map((item) => ({
        title: item.title,
        description: item.snipper,
        link: item.permalink,
        pubDate: parseDate(item.date, 'YYYY/MM/DD'),
        author: item.author.name,
    }));

    const out = await Promise.all(list.map((info) => parseArticle(info, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `${name}的收藏-人人都是产品经理`,
        description: userInfo.description,
        image: userInfo.avartar,
        link: `${baseUrl}/u/${id}`,
        item: out,
    };
};
