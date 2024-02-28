module.exports = function (router) {
    router.get('/jwc/:category?', './jwc/notice');
    router.get('/jxjy/news', './e/news');
    router.get('/yjs', './gschool/yjs');
};
