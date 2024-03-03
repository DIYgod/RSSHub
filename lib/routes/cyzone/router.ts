export default (router) => {
    router.get('/author/:id', './author');
    router.get('/channel/:id?', './');
    router.get('/label/:name', './label');
    router.get('/:id?', './');
};
