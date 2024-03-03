export default (router) => {
    router.get('/cae/:type/:getDescription?', './college/cae');
    router.get('/cs/:type/:getDescription?', './college/cs');
    router.get('/jwc/:type/:getDescription?', './jwc/jwc');
    router.get('/yjsy/:type/:getDescription?', './yjsy/yjsy');
};
