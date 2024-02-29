module.exports = (router) => {
    router.get('/portfolio/:id', './portfolio');
    router.get('/:category?', './index');
};
