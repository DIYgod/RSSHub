export default (router) => {
    router.get('/daily', './daily');
    router.get('/:id?', './index');
};
