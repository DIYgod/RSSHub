module.exports = function (router) {
    router.get('/report', require('./report'));
    router.get('/weekly/:category?', require('./weekly'));
};
