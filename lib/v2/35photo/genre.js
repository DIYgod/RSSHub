const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const currentUrl = `${rootUrl}/genre_${id}`;

    ctx.state.data = await ProcessItems(currentUrl);
};
