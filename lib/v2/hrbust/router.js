module.exports = function (router) {
    router.get('/jwzx/:type?/:page?', require('./jwzx'));
};
