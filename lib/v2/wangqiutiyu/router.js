module.exports = function (router) {
    router.get('/anchor/:id', require('./anchor'));
};
