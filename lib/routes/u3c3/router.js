module.exports = function (router) {
    router.get('/search/:keyword/:preview?', './index');
    router.get('/:type?/:preview?', './index');
};
