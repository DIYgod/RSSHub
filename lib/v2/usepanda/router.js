module.exports = function (router) {
    router.get('/feeds/:id', require('./index'));
};
