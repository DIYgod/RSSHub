module.exports = function (router) {
    router.get('/news/:category?/:language?', require('./news'));
};
