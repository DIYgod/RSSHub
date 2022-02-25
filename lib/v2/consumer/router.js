module.exports = function (router) {
    router.get('/:category?/:language?/:keyword?', require('./index'));
};
