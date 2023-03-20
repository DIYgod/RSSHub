const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');
const path = require('path');
const { baseUrl, getUserInfoFromUsername, getUserInfoFromId, getUserWorks } = require('./utils');

module.exports = async (ctx) => {
    let { id } = ctx.params;
    const limit = parseInt(ctx.query.limit) || 100;

    if (id.length !== 33) {
        id = (await getUserInfoFromUsername(id, ctx.cache.tryGet)).id;
    }

    const userInfo = await getUserInfoFromId(id, ctx.cache.tryGet);
    const userWorks = await getUserWorks(id, limit, ctx.cache.tryGet);

    const items = userWorks.map((item) => ({
        title: item.title || '无题',
        description: art(path.join(__dirname, 'templates/user.art'), { item }),
        author: item.uploaderInfo.nickName,
        pubDate: parseDate(item.createdTime, 'x'),
        link: `${baseUrl}/community/photo-details/${item.id}`,
    }));

    ctx.state.data = {
        title: userInfo.nickName,
        description: userInfo.about,
        image: userInfo.avatar.a1,
        link: `${baseUrl}/${id}`,
        item: items,
    };
};
