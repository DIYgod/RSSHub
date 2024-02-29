module.exports = function (router) {
    router.get('/banner', './banner');
    router.get('/news/:caty?', './news');
    router.get('/newsflash', './newsflash');
};
