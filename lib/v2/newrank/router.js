module.exports = (router) => {
    router.get('/douyin/:dyid', require('./douyin'));
    router.get('/wechat/:wxid', require('./wechat'));
};
