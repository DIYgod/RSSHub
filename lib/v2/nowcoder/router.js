module.exports = function (router) {
    router.get('/experience/:tagId', require('./experience'));
};
