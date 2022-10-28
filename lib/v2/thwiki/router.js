module.exports = function (router) {
    router.get('/calendar/:before?/:after?', require('./index'));
};
