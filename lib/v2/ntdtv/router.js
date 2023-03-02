module.exports = function (router) {
    router.get('/:language/:id', require('./channel'));
};
