module.exports = (router) => {
    router.get('/douyin/:dyid', './douyin');
    router.get('/wechat/:wxid', './wechat');
};
