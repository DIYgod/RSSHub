module.exports = (router) => {
    router.get('/home/:tag?', require('./home'));
    router.get('/keyword/:keyword', require('./keyword'));
    router.get('/subject/:id', require('./subject'));
    router.get('/user/:id', require('./user'));
};
