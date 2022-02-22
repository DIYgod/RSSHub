module.exports = function (router) {
    router.get('/:type?/:id?', require('./index'));
};
