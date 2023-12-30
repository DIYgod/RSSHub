module.exports = function (router) {
    router.get('/jiaowu/:category?', require('./jiaowu'));
};
