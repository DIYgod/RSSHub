module.exports = function (router) {
    // 前者是RSSHub的二级访问地址，后者是js文件
    router.get('/today', require('./subscribe.js'));
};
