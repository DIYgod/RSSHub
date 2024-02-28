module.exports = function (router) {
    router.get('/highlights', './main');
    router.get('/main', './main');
    router.get('/', './main');
};
