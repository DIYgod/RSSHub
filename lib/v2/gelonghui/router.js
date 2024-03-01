module.exports = (router) => {
    router.get('/home/:tag?', require('./home'));
    router.get('/hot-article/:type?', require('./hot-article'));
    router.get('/keyword/:keyword', require('./keyword'));
    router.get('/live', require('./live'));
    router.get('/subject/:id', require('./subject'));
    router.get('/user/:id', require('./user'));
};
