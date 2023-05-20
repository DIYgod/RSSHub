module.exports = function (router) {
    router.get('/column/:id', require('./column'));
    router.get('/ranking/:id?/:period?', require('./toplist'));
    router.get('/toplist/:id?/:period?', require('./toplist'));
    router.get('/thinktank/:id/:type?', require('./thinktank'));
};
