module.exports = (router) => {
    router.get('/cs/:type/:getDescription?', require('./cs/index'));
    router.get('/jwc/:type/:getDescription?', require('./jwc/jwc'));
    router.get('/yjsy/:type?', require('./yjsy/yjsy'));
};
