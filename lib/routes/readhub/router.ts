export default (router) => {
    router.get('/daily', './daily');
    router.get('/:category?', './');
};
