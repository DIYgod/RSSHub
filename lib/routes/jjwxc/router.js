export default (router) => {
    router.get('/author/:id?', './author');
    router.get('/book/:id?', './book');
};
