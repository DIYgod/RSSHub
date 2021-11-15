import {generatePopularData} from './utils.js';

export default async (ctx) => {
    ctx.state.data = await generatePopularData(ctx.params.timeframe);
};
