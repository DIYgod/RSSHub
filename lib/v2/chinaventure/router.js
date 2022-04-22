module.exports = function (router) {
    router.get('/news/:id?', require('./index'));
};
