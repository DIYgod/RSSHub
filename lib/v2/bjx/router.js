module.exports = (router) => {
    router.get('/gf/:type', require('./types'));
    router.get('/huanbao', require('./huanbao'));
};
