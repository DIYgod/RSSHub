module.exports = (router) => {
    router.get('/gf/:type', './types');
    router.get('/huanbao', './huanbao');
};
