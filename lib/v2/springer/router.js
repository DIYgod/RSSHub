module.exports = function (router) {
    router.get('/journal/:journal', require('./journal'));
};
