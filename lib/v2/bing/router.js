module.exports = function (router) {
    router.get('/', './daily-wallpaper');
    router.get('/search/:keyword', './search');
};
