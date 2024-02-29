module.exports = (router) => {
    router.get('/daily', './daily');
    router.get('/:category?', './');
};
