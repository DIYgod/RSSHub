module.exports = function (router) {
    router.get('/search/:keyword?', './search');
    router.get('/:category?', './index');
};
