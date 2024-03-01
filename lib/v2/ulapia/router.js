module.exports = function (router) {
    router.get('/reports/:category?', require('./index'));
    router.get('/research/latest', require('./research'));
};
