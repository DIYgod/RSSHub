module.exports = function (router) {
    // 《明日方舟》游戏内公告
    router.get('/announce/:platform?/:group?', require('./announce'));
    // アークナイツ(明日方舟日服)
    router.get('/japan', require('./japan'));
    // 《明日方舟》游戏公告与新闻
    router.get('/news', require('./news'));
};
