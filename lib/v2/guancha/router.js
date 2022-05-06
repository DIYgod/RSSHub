module.exports = function (router) {
    router.get('/headline', require('./headline'));
    router.get('/member/:category?', require('./member'));
    router.get('/personalpage/:uid', require('./personalpage'));
    router.get('/topic/:id/:order?', require('./topic'));
    router.get('/:category?', require('./index'));
};
