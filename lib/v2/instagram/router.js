module.exports = (router) => {
    router.get('/:category/:key', require('./private-api/index'));
};
