module.exports = function (router) {
    router.get('/campaign/:type/:free?', require('./campaign'));
    router.get('/new/:type', require('./new'));
};
