module.exports = function (router) {
    router.get('/:source?/:id?', require('./index'));
};
