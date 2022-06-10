module.exports = function (router) {
    router.get('/latest/:type?', require('./latest'));
    router.get('/detail/:id', require('./detail'));
};
