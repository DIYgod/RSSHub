const { parsePage } = require('./utils');

module.exports = async (ctx) => {
    const url = 'https://macmenubar.com/recently-added';
    const { title, items } = await parsePage(url);
    ctx.state.data = {
        title,
        link: String(url),
        item: items,
    };
};
