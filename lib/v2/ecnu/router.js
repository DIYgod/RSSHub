module.exports = function (router) {
    router.get('/acm/contest/:category?', './contest');
    router.get('/yjs', './yjs');
};
