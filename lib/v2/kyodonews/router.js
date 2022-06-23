module.exports = function (router) {
    router.get('/:language?/:keyword?', require('./index'));
};
