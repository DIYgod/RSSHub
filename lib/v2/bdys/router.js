module.exports = function (router) {
    router.get('/:caty?/:type?/:area?/:year?/:order?', './index');
};
