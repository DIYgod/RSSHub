module.exports = function (router) {
    router.get('/news/:lang?', './news');
};
