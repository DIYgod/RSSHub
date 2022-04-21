module.exports = async (link, ctx) => {
    if (link.startsWith('https://xinwen.wh.sdu.edu.cn/')) {
        return await require('./wh/news')(link, ctx);
    }
    if (link.startsWith('https://www.view.sdu.edu.cn/')) {
        return await require('./view')(link, ctx);
    }
    if (link.startsWith('https://www.sdrj.sdu.edu.cn/')) {
        return await require('./sdrj')(link, ctx);
    }
    if (link.startsWith('https://jwc.wh.sdu.edu.cn/')) {
        return await require('./wh/jwc')(link, ctx);
    }
    return {};
};
