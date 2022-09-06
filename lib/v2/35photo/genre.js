const { rootUrl, ProcessItems } = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const currentUrl = `${rootUrl}/genre_${id}`;
    const apiUrl = `${rootUrl}/show_block.php?type=getNextPageData&page=genre&community_id=${id}`;

    ctx.state.data = await ProcessItems(currentUrl, apiUrl);
};
