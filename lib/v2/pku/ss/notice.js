const { baseUrl, getSingleRecord, getArticle } = require('./common');

const host = `${baseUrl}/newscenter/notice/`;

module.exports = async (ctx) => {
    const items = await getSingleRecord(host);
    const out = await Promise.all(items.map((item) => getArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: '北大软微-通知公告',
        description: '北京大学软件与微电子学院 - 通知公告',
        link: host,
        item: out,
    };
};
