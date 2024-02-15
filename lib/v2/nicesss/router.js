module.exports = (router) => {
    router.get('/:limit?', require('./index'));
    router.get('/search/:keyword/:limit?', require('./search'));
    router.get('/tag/:tag_id/:limit?', require('./tag'));
    router.get('/category/:category_id/:limit?', require('./category'));
};
