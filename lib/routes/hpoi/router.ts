export default (router) => {
    router.get('/info/:type?', './info');
    router.get('/items/all/:order?', './all');
    router.get('/items/character/:id/:order?', './character');
    router.get('/items/work/:id/:order?', './work');
    router.get('/user/:user_id/:caty', './user');
    router.get('/bannerItem', './banner-item');
};
