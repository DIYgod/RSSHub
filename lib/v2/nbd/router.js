module.exports = (router) => {
    router.get('/daily', './daily');
    router.get('/:id?', './index');
};
