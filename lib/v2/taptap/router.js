module.exports = (router) => {
    router.get('/changelog/:id', require('./changelog'));
    router.get('/review/:id/:order?/:lang?', require('./review'));
    router.get('/topic/:id/:type?/:sort?/:lang?', require('./topic'));
};
