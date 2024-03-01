module.exports = function (router) {
    router.get('/inquire/:category?/:select?/:keyword?', require('./inquire'));
    router.get('/notice', require('./notice'));
    router.get('/projectdynamic/:type?/:stage?/:status?', require('./projectdynamic'));
    router.get('/rule', require('./rule'));
};
