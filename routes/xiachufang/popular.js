const { generatePopularData } = require('./utils');

module.exports = async (ctx) => {
    ctx.state.data = await generatePopularData(ctx.params.timeframe);
};
