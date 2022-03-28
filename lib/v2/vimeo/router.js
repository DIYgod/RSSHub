module.exports = (router) => {
    router.get('/category/:category/:staffpicks?', require('./category'));
    router.get('/channel/:channel', require('./channel'));
    router.get('/user/:username/:cat?', require('./usr-videos'));
};
