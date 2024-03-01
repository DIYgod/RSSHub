module.exports = function (router) {
    router.get('/:params?', require('./index'));
};
