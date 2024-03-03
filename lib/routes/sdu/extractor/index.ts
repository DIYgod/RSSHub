// @ts-nocheck
module.exports = (link) => {
    if (link.startsWith('https://xinwen.wh.sdu.edu.cn/')) {
        return require('./wh/news')(link);
    }
    if (link.startsWith('https://www.view.sdu.edu.cn/')) {
        return require('./view')(link);
    }
    if (link.startsWith('https://www.sdrj.sdu.edu.cn/')) {
        return require('./sdrj')(link);
    }
    if (link.startsWith('https://jwc.wh.sdu.edu.cn/')) {
        return require('./wh/jwc')(link);
    }
    return {};
};
