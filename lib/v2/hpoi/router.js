module.exports = function (router) {
    router.get('/info/:type?', require('./info'));
    router.get('/items/all/:order?', require('./all'));
    router.get('/items/character/:id/:order?', require('./character'));
    router.get('/items/work/:id/:order?', require('./work'));
    router.get('/user/:user_id/:caty', require('./user'));
    router.get('/bannerItem', require('./banner-item'));
};
