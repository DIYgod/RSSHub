module.exports = function (router) {
    router.get('/epaper/:id?', './epaper');
    router.get('/news/:category*', './news');
};
