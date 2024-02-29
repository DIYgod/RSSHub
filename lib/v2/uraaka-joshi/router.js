module.exports = (router) => {
    router.get('/', './uraaka-joshi');
    router.get('/:id', './uraaka-joshi-user');
};
