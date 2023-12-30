module.exports = (router) => {
    router.get('/cae/:type/:getDescription?', require('./college/cae'));
    router.get('/cs/:type/:getDescription?', require('./college/cs'));
    router.get('/jwc/:type/:getDescription?', require('./jwc/jwc'));
    router.get('/yjsy/:type/:getDescription?', require('./yjsy/yjsy'));
};
