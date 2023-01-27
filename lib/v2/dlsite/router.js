module.exports = function (router) {
    router.get('/new/:type', require('./new'));
    router.get('/campaign/:type/:free?', require('./campaign'));
};
