module.exports = function (router) {
    router.get('/jwzx/:page?/:type?', require('./jwzx'));
};