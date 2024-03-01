module.exports = function (router) {
    router.get('/shopping-guide/:category?/:language?', require('./shopping-guide'));
    router.get('/:category?/:language?/:keyword?', require('./index'));
};
