module.exports = function (router) {
    router.get('/:what?/:id?', require('./index'));
};
