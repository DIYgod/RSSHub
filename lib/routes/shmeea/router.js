module.exports = function (router) {
    router.get('/self-study', './self-study');
    router.get('/:id?', './index');
};
