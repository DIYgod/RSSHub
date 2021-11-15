const { generatePopularData } = require('./utils');

export default async (ctx) => {
    ctx.state.data = await generatePopularData(ctx.params.timeframe);
};
