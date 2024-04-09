module.exports = function (router) {
    router.get('/materials/:id?', require('./materials'));
};
