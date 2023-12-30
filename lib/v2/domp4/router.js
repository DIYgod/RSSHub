module.exports = function (router) {
    router.get('/detail/:id', require('./detail'));
    router.get('/latest/:type?', require('./latest'));
};
