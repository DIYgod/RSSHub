module.exports = function (router) {
    router.get('/page/:id', require('./page'));
};
