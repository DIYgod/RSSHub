const utils = require('./utils');

module.exports = async (ctx) => {
    const timeframe = ctx.params.timeframe;

    ctx.state.data = await utils.getData('Popular Shots', `https://dribbble.com/shots${timeframe ? `?timeframe=${timeframe}` : ''}`);
};
