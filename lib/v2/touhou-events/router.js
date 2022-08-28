module.exports = function (router) {
    router.get('/thwiki/:before?/:after?', require('./index'));
};
