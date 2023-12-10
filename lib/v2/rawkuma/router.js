module.exports = function (router) {
    router.get('/manga/:id', require('./manga'));
};
