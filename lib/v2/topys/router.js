module.exports = function (router) {
    router.get('/:keyword?', require('./index'));
};
