module.exports = function (router) {
    router.get('/jxjy/news', require('./e/news'));
    router.get('/yjs', require('./gschool/yjs'));
    router.get('/jwc/:category?', require('./jwc/notice'));
};
