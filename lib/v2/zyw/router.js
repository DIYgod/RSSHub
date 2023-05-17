module.exports = function (router) {
    router.get('/hot/:site?', require('./hot'));
};
