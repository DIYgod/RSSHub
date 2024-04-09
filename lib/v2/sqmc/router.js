module.exports = function (router) {
    router.get('/www/:category?', require('./www'));
};
