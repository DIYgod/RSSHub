module.exports = function (router) {
    router.get('/journal/:id', require('./journal'));
};
