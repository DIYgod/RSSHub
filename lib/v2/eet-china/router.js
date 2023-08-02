module.exports = function (router) {
    router.get('/mp/:category?', require('./mp'));
};
