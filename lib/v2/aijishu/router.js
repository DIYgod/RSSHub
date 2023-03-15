module.exports = function (router) {
    router.get('/:type/:name?', require('.'));
};
