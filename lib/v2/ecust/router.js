module.exports = function (router) {
    router.get('/jwc/:category?', require('./jwc/notice'));
    router.get('/jxjy/news', require('./e/news'));
    router.get('/yjs', require('./gschool/yjs'));
};
