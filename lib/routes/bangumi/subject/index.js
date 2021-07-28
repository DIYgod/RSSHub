const getComments = require('./comments.js');
const getFromAPI = require('./offcial-subject-api.js');

const getEps = require('./ep.js');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    let response;
    if (ctx.params.type) {
        switch (ctx.params.type) {
            case 'comments':
                response = await getComments(id, Number(ctx.request.query.minLength) || 0);
                break;
            case 'blogs':
                response = await getFromAPI('blog')(id);
                break;
            case 'topics':
                response = await getFromAPI('topic')(id);
                break;
            default:
                throw Error(`暂不支持对${ctx.params.type}的订阅`);
        }
    } else {
        response = await getEps(id);
    }
    ctx.state.data = response;
};
