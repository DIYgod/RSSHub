module.exports = async (link, ctx) => {
    if (link.startsWith('https://xinwen.wh.sdu.edu.cn')) {
        return await require('./news')(link, ctx);
    }
    if (link.startsWith('https://www.view.sdu.edu.cn')) {
        return await require('./view')(link, ctx);
    }
    return {};
};
