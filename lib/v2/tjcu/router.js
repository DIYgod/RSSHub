module.exports = function (router) {
    router.get('/gs/:type', require('./gs'));
};
