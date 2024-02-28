module.exports = function (router) {
    router.get('/downloads/:productType/:productId', './downloads');
};
