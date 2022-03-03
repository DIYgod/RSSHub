module.exports = function (router) {
    router.get('/:collection', require('./index'));
};
