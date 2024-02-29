module.exports = function (router) {
    router.get('/news/:site?/:id?/:keyword?', './news');
    router.get('/:id?/:type?/:keyword?', './');
};
