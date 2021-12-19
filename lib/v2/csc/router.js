module.exports = function (router) {
    router.get('/notice/:type?', require('./notice'));
};
