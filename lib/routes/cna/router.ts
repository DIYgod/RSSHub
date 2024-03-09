export default (router) => {
    router.get('/:id?', './');
    router.get('/web/:id?', './web/');
};
