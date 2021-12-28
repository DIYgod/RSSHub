module.exports = function (router) {
    router.get('/hr/:category?', require('./hr'));
};
