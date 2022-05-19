module.exports = function (router) {
    router.get('/:language?/:category?', require('./index'));
};
