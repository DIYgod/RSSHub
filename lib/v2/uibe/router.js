module.exports = function (router) {
    router.get('/hr/:category?/:type?', './hr');
};
