module.exports = function (router) {
    router.get('/:os', require('./index'));
};
