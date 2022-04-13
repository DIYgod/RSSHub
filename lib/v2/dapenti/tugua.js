const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await utils.parseFeed({ subjectid: 70 }, ctx);
};
