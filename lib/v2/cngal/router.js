module.exports = function (router) {
    router.get('/entry/:id', './entry');
    router.get('/weekly', './weekly');
};
