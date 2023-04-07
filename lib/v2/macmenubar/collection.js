const { parsePage } = require('./utils');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `https://macmenubar.com/${category}`;
    const { title, items } = await parsePage(url);
    ctx.state.data = {
        title,
        link: String(url),
        item: items,
    };
};
