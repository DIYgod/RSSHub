module.exports = (router) => {
    router.get('/boards', './boards');
    router.get('/:board?', './index');
};
