module.exports = (router) => {
    router.get('/:category/:key', require('./private-api/index'));
    router.get('/2/:category/:key', require('./web-api/index'));
};
