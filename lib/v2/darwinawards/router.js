module.exports = function (router) {
    router.get('/all', require('./index'));
    router.get('/', require('./index'));
};
