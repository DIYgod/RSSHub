module.exports = function (router) {
    router.get('/epaper/:id?', require('./epaper'));
    router.get('/news/:category*', require('./news'));
};
