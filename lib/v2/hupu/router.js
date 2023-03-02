module.exports = function (router) {
    router.get('/all/:id?', require('./all'));
    router.get('/bbs/:id?/:order?', require('./bbs'));
    router.get('/bxj/:id?/:order?', require('./bbs'));
    router.get('/dept/:category?', require('./index'));
    router.get('/:category?', require('./index'));
};
