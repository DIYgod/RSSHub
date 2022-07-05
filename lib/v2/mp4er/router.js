module.exports = function (router) {
    router.get('/:type?/:caty?/:area?/:year?/:order?', require('./index'));
};
