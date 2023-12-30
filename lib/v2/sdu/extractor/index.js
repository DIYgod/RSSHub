module.exports = (link, ctx) => {
    if (link.startsWith('https://xinwen.wh.sdu.edu.cn/')) {
        return require('./wh/news')(link, ctx);
    }
    if (link.startsWith('https://www.view.sdu.edu.cn/')) {
        return require('./view')(link, ctx);
    }
    if (link.startsWith('https://www.sdrj.sdu.edu.cn/')) {
        return require('./sdrj')(link, ctx);
    }
    if (link.startsWith('https://jwc.wh.sdu.edu.cn/')) {
        return require('./wh/jwc')(link, ctx);
    }
    return {};
};
