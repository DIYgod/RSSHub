module.exports = function (router) {
    router.get('/hot/:bsn', require('./hot'));
};
