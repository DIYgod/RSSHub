const getComments = require('./comments.js');
const getFromAPI = require('./offcial-subject-api.js');
const getEps = require('./ep.js');
const { queryToBoolean } = require('@/utils/readable-social');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const type = ctx.params.type || 'ep';
    const showOriginalName = queryToBoolean(ctx.params.showOriginalName);
    let response;
    switch (type) {
        case 'ep':
            response = await getEps(id, showOriginalName);
            break;
        case 'comments':
            response = await getComments(id, Number(ctx.query.minLength) || 0);
            break;
        case 'blogs':
            response = await getFromAPI('blog')(id, showOriginalName);
            break;
        case 'topics':
            response = await getFromAPI('topic')(id, showOriginalName);
            break;
        default:
            throw Error(`暂不支持对${type}的订阅`);
    }
    ctx.state.data = response;
};
