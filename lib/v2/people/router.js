module.exports = function (router) {
    router.get('/liuyan/:id/:state?', require('./liuyan'));
    router.get('/xjpjh/:keyword?/:year?', require('./xjpjh'));
    router.get('/:site?/:category*', require('./'));
};
