module.exports = function (router) {
    router.get('/:path?', require('./index'));
};
