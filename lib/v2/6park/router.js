module.exports = function (router) {
    router.get('/news/:site?/:id?/:keyword?', require('./news'));
    router.get('/:id?/:type?/:keyword?', require('./'));
};
