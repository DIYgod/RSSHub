module.exports = function (router) {
    router.get('/', require('./rss'));
    router.get('/xxx', require('./xxx'));
};
