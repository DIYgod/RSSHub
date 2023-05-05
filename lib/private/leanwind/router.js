module.exports = function (router) {
    // 前者是RSSHub的访问地址，后者是js文件
    router.get('/cae', require('./subscribe.js'));
};
