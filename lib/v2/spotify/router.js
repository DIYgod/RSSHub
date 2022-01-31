module.exports = function (router) {
    router.get('/playlist/:id', require('./playlist'));
};
