module.exports = function (router) {
    router.get('/:channel/:id', require('./channel'));
};
