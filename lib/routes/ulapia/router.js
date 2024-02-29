module.exports = function (router) {
    router.get('/reports/:category?', './index');
    router.get('/research/latest', './research');
};
