module.exports = function (router) {
    router.get('/jwc/:category', require('./jwc'));
};
