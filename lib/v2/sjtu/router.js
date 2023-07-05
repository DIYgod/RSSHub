module.exports = function (router) {
    router.get('/gs/:type/:num?', require('./gs'));
};
