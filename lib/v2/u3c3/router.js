module.exports = function (router) {
    router.get('/:type?/:keyword?', require('./index'));
};
