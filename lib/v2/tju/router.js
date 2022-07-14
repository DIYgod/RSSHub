module.exports = function (router) {
    router.get('/oaa/:type?', require('./oaa'));
};
