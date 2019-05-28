const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await utils.parseFeed({ subjectid: ctx.params.id });
};
