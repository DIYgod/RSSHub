module.exports = function (router) {
    router.get('/', require('./daily-wallpaper'));
    router.get('/search/:keyword', require('./search'));
};
