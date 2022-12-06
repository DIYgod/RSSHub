module.exports = function (router) {
    router.get('/acm/contest/:category?', require('./contest'));
    router.get('/yjs', require('./yjs'));
};
