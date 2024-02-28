const utils = require('./utils');

module.exports = async (ctx) => {
    ctx.set('data', await utils.parseFeed({ subjectid: ctx.req.param('id') }));
};
