module.exports = (router) => {
    router.get('/:limit?', require('./index'));
    router.get('/search/:keyword/:limit?', require('./search'));
    router.get('/tag/:tag/:limit?', require('./tag'));
    router.get('/category/:category/:limit?', require('./category'));
};
