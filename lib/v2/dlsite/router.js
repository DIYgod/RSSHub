module.exports = function (router) {
    router.get('/campaign/:type/:free?', require('./campaign'));
    router.get('/ci-en/:id/article', require('./ci-en/article'));
    router.get('/new/:type', require('./new'));
    router.get(/([\w-=/]+)?/, require('./'));
};
