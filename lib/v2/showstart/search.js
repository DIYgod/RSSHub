const { TITLE, HOST } = require('./const');
const { fetchActivityList } = require('./service');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword;
    const { items } = await fetchActivityList({
        keyword,
    });
    ctx.state.data = {
        title: `${TITLE} - ${keyword}`,
        link: HOST,
        item: items,
    };
};
