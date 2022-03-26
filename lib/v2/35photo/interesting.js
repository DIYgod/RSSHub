const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const currentUrl = `${rootUrl}/new/interesting`;

    ctx.state.data = await ProcessItems(currentUrl);
};
