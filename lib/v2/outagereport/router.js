module.exports = function (router) {
    router.get('/:name/:count?', require('./index'));
};
