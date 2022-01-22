module.exports = function (router) {
    router.get('/:section?/:type?', require('./index'));
};
