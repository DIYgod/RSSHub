export default (router) => {
    router.get('/home/:tag?', './home');
    router.get('/hot-article/:type?', './hot-article');
    router.get('/keyword/:keyword', './keyword');
    router.get('/live', './live');
    router.get('/subject/:id', './subject');
    router.get('/user/:id', './user');
};
