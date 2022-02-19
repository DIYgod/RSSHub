module.exports = function (router) {
    router.get('/:id?/:type?/:keyword?', require('./index'));
};
