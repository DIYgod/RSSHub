module.exports = function (router) {
    router.get('/:category?/:keyword?', require('./index'));
};
