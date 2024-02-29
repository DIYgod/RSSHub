module.exports = (router) => {
    router.get('/ceic/:type?', './ceic');
    router.get('/:region?', './index');
};
