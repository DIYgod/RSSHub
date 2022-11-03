module.exports = function (router) {
    router.get('/:site', require('./index'));
    router.get('/', require('./index'));
};
