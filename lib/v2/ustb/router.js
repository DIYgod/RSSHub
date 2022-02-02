module.exports = function (router) {
    router.get('/ustb/news/:type?', require('./yjsy/news'));
};
