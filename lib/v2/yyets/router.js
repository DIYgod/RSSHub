module.exports = function (router) {
    router.get('/article/:type?', './article');
    router.get('/today', './today');
};
