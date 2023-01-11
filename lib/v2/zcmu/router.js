module.exports = function (router) {
    router.get('/jwc/:type?', require('./jwc'));
};
