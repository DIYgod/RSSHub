const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const { baseUrl, getTribeDetail, getTribeSets } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = parseInt(ctx.query.limit) || 100;

    const { tribe } = await getTribeDetail(id, ctx.cache.tryGet);
    const tribeSets = await getTribeSets(id, limit, ctx.cache.tryGet);

    const items = tribeSets.map((item) => ({
        title: item.title,
        description: art(path.join(__dirname, 'templates/tribeSet.art'), { item }),
        author: item.uploaderInfo.nickName,
        pubDate: parseDate(item.createdTime, 'x'),
        link: `${baseUrl}/community/set/${item.id}/details`,
    }));

    ctx.state.data = {
        title: tribe.name,
        description: `${tribe.watchword} - ${tribe.introduce}`,
        link: `${baseUrl}/page/tribe/detail?tribeId=${id}&pagev=set`,
        image: tribe.avatar.a1,
        item: items,
    };
};
