module.exports = function (router) {
    router.get('/comic/:name', require('./index'));
};
