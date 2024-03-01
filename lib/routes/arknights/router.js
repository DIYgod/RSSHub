export default (router) => {
    // 《明日方舟》游戏内公告
    router.get('/announce/:platform?/:group?', './announce');
    // アークナイツ(明日方舟日服)
    router.get('/japan', './japan');
    // 《明日方舟》游戏公告与新闻
    router.get('/news', './news');
};
