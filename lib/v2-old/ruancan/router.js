module.exports = function (router) {
    router.get('/:do?/:keyword?', require('./index'));
};
