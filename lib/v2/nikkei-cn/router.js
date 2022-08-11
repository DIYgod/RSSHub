module.exports = function (router) {
    router.get('/:language?/:category?/:type?', require('./index'));
};
