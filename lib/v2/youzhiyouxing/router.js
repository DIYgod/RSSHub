module.exports = function (router) {
    router.get('/materials/:column?', require('./materials'));
};
