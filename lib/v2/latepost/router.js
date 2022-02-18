module.exports = function (router) {
    router.get('/:proma?', require('./index'));
};
