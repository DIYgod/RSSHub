module.exports = function (router) {
    router.get('/:type', require('./index'));
};
