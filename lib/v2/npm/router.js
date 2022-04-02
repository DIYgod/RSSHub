module.exports = function (router) {
    router.get('/package/:name', require('./package'));
};
