module.exports = function (router) {
    router.get('/:category?/:language?', require('./index'));
};
